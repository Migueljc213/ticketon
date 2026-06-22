import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

export interface SocialProfile {
  email: string;
  name: string;
  avatarUrl: string | null;
  provider: 'google' | 'facebook';
}

@Injectable()
export default class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') ?? '',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') ?? '',
      callbackURL: `${config.get<string>('BACKEND_URL') ?? 'http://localhost:3000'}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: { emails?: Array<{ value: string }>; displayName?: string; photos?: Array<{ value: string }> },
    done: VerifyCallback,
  ): Promise<void> {
    const socialProfile: SocialProfile = {
      email: profile.emails?.[0]?.value ?? '',
      name: profile.displayName ?? 'Usuário Google',
      avatarUrl: profile.photos?.[0]?.value ?? null,
      provider: 'google',
    };
    done(null, socialProfile);
  }
}
