import { Module } from '@nestjs/common';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { GoongMapProvider } from './providers/goong-map.provider';

@Module({
  controllers: [MapController],
  providers: [MapService, GoongMapProvider],
  exports: [MapService],
})
export class MapModule {}
