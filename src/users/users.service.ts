import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SignUpDto } from './dtos/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { Token } from 'src/utils/tokens.utils';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private config: ConfigService,
  ) {}

  private readonly ACCESS_TOKEN_SECRET = this.config.get('ACCESS_TOKEN_SECRET');
  private readonly BREVO_API_KEY = this.config.get('BREVO_MAIL_API_KEY');
  private readonly SENDER_EMAIL = this.config.get('FIREBLOCKS_SENDER_EMAIL');
  private readonly SENDER_NAME = this.config.get('FIREBLOCKS_SENDER_NAME');

  async createUser(payload: SignUpDto) {
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = this.usersRepository.create({
      email: payload.email,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);

    return user;
  }

  async login(payload: SignUpDto) {
    const user = await this.usersRepository.findOne({
      where: { email: payload.email },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = new Token(this.ACCESS_TOKEN_SECRET).generateAccessToken({
      user,
    });

    return {
      accessToken: token,
      user,
    };
  }

  private async generateTemplateString(filename: string, payload: any) {
    try {
      const cwd = process.cwd();
      const filepath = `${cwd}/templates/${filename}.hbs`;

      const templateFile = fs.readFileSync(filepath, 'utf8');

      const template = Handlebars.compile(templateFile, { noEscape: true });

      return template(payload);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async sendEmail(payload: {
    emailPayload: object;
    templateType: any;
    recipientEmail: string;
    recipientName: string;
    emailSubject: any;
    scheduledAt?: Date;
  }) {
    const data = {
      sender: {
        name: this.SENDER_NAME,
        email: this.SENDER_EMAIL,
      },
      to: [
        {
          email: payload.recipientEmail,
          name: payload.recipientName,
        },
      ],
      subject: payload.emailSubject,
      htmlContent: await this.generateTemplateString(
        payload.templateType,
        payload.emailPayload,
      ),
    };

    const headers = {
      accept: 'application/json',
      'api-key': this.BREVO_API_KEY,
      'content-type': 'application/json',
    };

    try {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        data,
        {
          headers,
        },
      );

      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
