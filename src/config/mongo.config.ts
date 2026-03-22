import { ConfigService } from '@nestjs/config';

export const mongoConfig = {
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('MONGO_URI'),
  }),
  inject: [ConfigService],
};
