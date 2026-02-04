import {
  Injectable,
  BadRequestException,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { UserService } from 'src/user/user.service';
import { UtilService } from 'src/util/util.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { SignUpDto } from './dto/signup.dto';
import { DbService } from "../db/db.service";
import * as bcrypt from 'bcrypt';

import { SESv2Client, CreateEmailIdentityCommand, GetEmailIdentityCommand } from "@aws-sdk/client-sesv2";
import {
  CognitoIdentityProviderClient,
  SignUpCommand, InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AdminConfirmSignUpCommand,
  AdminAddUserToGroupCommand
} from '@aws-sdk/client-cognito-identity-provider';

@Injectable()
export class AuthService {
  private ses: SESv2Client;
  private readonly secretKey: string;
  private readonly apiKey: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly cognitoClient: CognitoIdentityProviderClient;
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly utilService: UtilService,
    public dbService: DbService,
  ) {
    const userPoolId = this.config.get<string>('COGNITO_USER_POOL_ID');
    this.clientId = this.config.get<string>('COGNITO_CLIENT_ID')!;
    this.clientSecret = this.config.get<string>('COGNITO_CLIENT_SECRET')!;  // Added this line
    this.secretKey = this.config.get<string>('JWT_SECRET') || '';
    this.apiKey = this.config.get<string>('API_KEY') || '';
    if (!userPoolId || !this.clientId || !this.clientSecret) {
      throw new Error('Missing Cognito config values');
    }
    this.ses = new SESv2Client({
      region: this.config.get<string>('AWS_REGION') || "eu-north-1",
    });
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.config.get<string>('AWS_REGION') || 'eu-north-1',
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
  }

  //sign up code with cognito 
  async signUp(request: { email: string; password: string; name: string, phone_number: string, role: string, agency_id: number }): Promise<any> {
    const { email, password, name, phone_number, role, agency_id } = request;
    const secretHash = this.utilService.generateSecretHash(email, this.clientId, this.clientSecret);
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
    const command = new SignUpCommand({
      ClientId: this.clientId,
      Username: email,
      Password: password,
      SecretHash: secretHash,
      UserAttributes: [
        {
          Name: 'email',
          Value: request.email,
        },
        {
          Name: 'name',
          Value: request.name,
        },
        {
          Name: 'phone_number',
          Value: "+917043097908", // Use E.164 format. Example: +11234567890 for US.
        },
      ],
      // MessageAction: 'SUPPRESS'
    });
    try {
      const response = await this.cognitoClient.send(command);
      //confirm the user instant 
      const confirmCommand = new AdminConfirmSignUpCommand({
        UserPoolId: this.config.get<string>('COGNITO_USER_POOL_ID')!,
        Username: email,
      });
      let confirmResult = await this.cognitoClient.send(confirmCommand);
      console.log('Cognito user confirmed successfully:', confirmResult);
      // 3️⃣ Add user to Cognito group
      const groupName = role; // assuming you want to use `role` as group name
      const addToGroupCommand = new AdminAddUserToGroupCommand({
        UserPoolId: this.config.get<string>('COGNITO_USER_POOL_ID')!,
        Username: email,
        GroupName: groupName,
      });
      await this.cognitoClient.send(addToGroupCommand);
      console.log(`User added to group "${groupName}"`);
      // 4️⃣ SES Email Verification
      try {
        const getCmd = new GetEmailIdentityCommand({
          EmailIdentity: email,
        });
        const result = await this.ses.send(getCmd);
        console.log(result, 'result')
        if (result.VerificationStatus === "PENDING") {
          console.log(`⌛ ${email} verification is still pending.`);
        } if (result.VerificationStatus === "FAILED") {
          console.log(`${email} verification failed. You may need to re-verify.`);
        }
       console.log(`${email} status: ${result.VerificationStatus}`);
       
      } catch (sesErr) {
        if (sesErr.name === "AlreadyExistsException") {
          console.log("Email identity already exists, skipping verification");
        }
        if (sesErr.name !== "NotFoundException") {
             try {
        //case when email id not found in  ses 
      const verifyCmd = new CreateEmailIdentityCommand({
        EmailIdentity: email,
      });
      await this.ses.send(verifyCmd);
      console.log(`📧 SESv2 verification email sent to ${email}`);
    } catch (createErr) {
      console.error(`❌ SES verification failed for ${email}`, createErr);
    }   console.error(`Failed to check email identity for ${email}`, sesErr);
          // return;
        }
      }
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');
      const usercreatePayload = {
        first_name: firstName,
        last_name: lastName || '',
        email,
        phone: phone_number,
        created_dt: new Date(),
        email_verified: 0,
        phone_verified: 0,
        password: hashedPassword,
        cognitoId: response.UserSub,// Add this
        role: role,
        agency_id: agency_id
      };
      // Optional DB sync
      return await this.createUser(usercreatePayload);
    } catch (error) {
      if (error.name === 'UsernameExistsException') {
        throw new BadRequestException('User already exists');
      }
      throw new BadRequestException(error.message || 'Signup failed');
    }
  }

  getToken(userId, userEmail) {
    const tokenCreationTime = Math.floor(Date.now() / 1000);
    const jti = uuidv4();
    const payload = {
      iss: this.apiKey,
      iat: tokenCreationTime,
      jti: jti,
      sub: userId,
      email: userEmail
    };
    const token = jwt.sign(payload, this.secretKey);
    return token;
  }

  async createUser(usercreatePayload) {
    try {
      //const hashedPassword = await bcrypt.hash(usercreatePayload.password, 10); // 10 is the salt rounds
      const setData = [
        { set: 'first_name', value: String(usercreatePayload.first_name) },
        { set: 'last_name', value: String(usercreatePayload.last_name) },
        { set: 'email', value: String(usercreatePayload.email) },
        { set: 'password', value: String(usercreatePayload.password ?? '') },
        { set: 'phone', value: String(usercreatePayload.phone_number ?? '') },
        { set: 'role', value: String(usercreatePayload.role ?? '') },
        { set: 'agency_id', value: String(usercreatePayload.agency_id ?? '') },
      ]
      const insertion = await this.dbService.insertData('users', setData);
      return this.utilService.successResponse(insertion, 'User created successfully.');
    } catch (error) {
      console.error('Create User Error:', error);
      throw error;
    }
  }

 async signIn(
  request: { email: string; password: string },
): Promise<any> {
  const { email, password } = request;

   // 1. Fetch user from DB
   const users = await this.dbService.execute(`SELECT
      id,
      first_name,
      last_name,
      email,
      password,
      agency_id,
      status,role
    FROM users
    WHERE email = '${email}'
    LIMIT 1
  `);

 
  if (!users || users.length === 0) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const user = users[0];

  // 2. Check if user is active
  if (user.status !== 1) {
    throw new UnauthorizedException('User is not active');
  }

  // ----------------------------------------------------
  // ❌ Cognito logic intentionally commented / removed
  // ----------------------------------------------------
  // const secretHash = this.utilService.generateSecretHash(
  //   email,
  //   this.clientId,
  //   this.clientSecret,
  // );
  // const command = new InitiateAuthCommand({
  //   AuthFlow: 'USER_PASSWORD_AUTH',
  //   ClientId: this.clientId,
  //   AuthParameters: {
  //     USERNAME: email,
  //     PASSWORD: password,
  //     SECRET_HASH: secretHash,
  //   },
  // });
  // ----------------------------------------------------

  // 3. Verify password
  const isPasswordValid = await bcrypt.compare(
    password,
    user.password,
  );
const hash = await bcrypt.hash('Admin@123', 10);
console.log(hash);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid email or password1');
  }

  // 4. JWT payload
  const payload = {
    sub: user.id,
    email: user.email,
    role:user.role,
    agency_id: user.agency_id,
  };

  // 5. Generate tokens
  const accessToken = this.jwtService.sign(payload, {
    secret: process.env.JWT_SECRET,
    expiresIn: '1h',
  });

  const refreshToken = this.jwtService.sign(payload, {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d',
  });

  // 6. Response
  return {
    accessToken,
    refreshToken,
    agency_id: Number(user.agency_id),
    role:user.role,
    id: Number(user.id),
  };
}


  async forgotPassword(email: string): Promise<any> {
    const secretHash = this.utilService.generateSecretHash(email, this.clientId, this.clientSecret);

    const command = new ForgotPasswordCommand({
      ClientId: this.clientId,
      Username: email,
      SecretHash: secretHash,
    });

    try {
      const response = await this.cognitoClient.send(command);
      return {
        success: true,
        message: 'Password reset code sent to your email',
        codeDeliveryDetails: response.CodeDeliveryDetails
      };
    } catch (err) {
      console.error('Cognito forgot password error:', err);
      throw new BadRequestException(err.message || 'Failed to initiate password reset');
    }
  }

  async resetPassword(email: string, verificationCode: string, newPassword: string): Promise<any> {
    const secretHash = this.utilService.generateSecretHash(email, this.clientId, this.clientSecret);

    const command = new ConfirmForgotPasswordCommand({
      ClientId: this.clientId,
      Username: email,
      ConfirmationCode: verificationCode,
      Password: newPassword,
      SecretHash: secretHash,
    });

    try {
      await this.cognitoClient.send(command);
      return {
        success: true,
        message: 'Password has been reset successfully'
      };
    } catch (err) {
      console.error('Cognito reset password error:', err);
      throw new BadRequestException(err.message || 'Failed to reset password');
    }
  }


   async googleLogin(profile: any) {
  const { email, given_name, family_name, sub } = profile;

  // 1️⃣ Fetch user from DB
  const users = await this.dbService.executeQuery(`
    SELECT
      id,
      first_name,
      last_name,
      email,
      role,
      status,
      google_id,
      provider
    FROM users
    WHERE email = $1
    LIMIT 1
  `, [email]);
  let user = users?.[0];
  // 2️⃣ Create user if not exists
  if (!user) {
    const insertResult = await this.dbService.executeQuery(`
      INSERT INTO users (
        email,
        first_name,
        last_name,
        google_id,
        provider,
        status,
        role
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        email,
        first_name,
        last_name,
        role,
        status
    `, [
      email,
      given_name || '',
      family_name || '',
      sub,
      'google',
      1,          // active
      'user',     // default role
    ]);

    user = insertResult[0];
  }

  // 3️⃣ Generate JWT
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
const accessToken = this.jwtService.sign(payload);
  // 4️⃣ Return response
  return {
    accessToken,
    user,
  };
}

generateTokens(user: {
  id: number;
  email: string;
  role: string;
  agency_id?: number;
}) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    agency_id: user.agency_id,
  };

  const accessToken = this.jwtService.sign(payload, {
    secret: process.env.JWT_SECRET,
    expiresIn: '1h',
  });

  const refreshToken = this.jwtService.sign(payload, {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d',
  });

  return {
    accessToken,
    refreshToken,
  };
}

}
