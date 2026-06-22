import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import type { SocialProfile } from './google.strategy';

@Injectable()
export default class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('FACEBOOK_APP_ID') ?? '',
      clientSecret: config.get<string>('FACEBOOK_APP_SECRET') ?? '',
      callbackURL: `${config.get<string>('BACKEND_URL') ?? 'http://localhost:3000'}/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'name', 'picture'],
      scope: ['email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: unknown, user?: SocialProfile) => void,
  ): Promise<void> {
    const firstName = (profile.name as { givenName?: string } | undefined)?.givenName ?? '';
    const lastName  = (profile.name as { familyName?: string } | undefined)?.familyName ?? '';
    const socialProfile: SocialProfile = {
      email: profile.emails?.[0]?.value ?? '',
      name: `${firstName} ${lastName}`.trim() || 'Usuário Facebook',
      avatarUrl: profile.photos?.[0]?.value ?? null,
      provider: 'facebook',
    };
    done(null, socialProfile);
  }
}
