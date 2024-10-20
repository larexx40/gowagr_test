import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('GoWagr Backend Engineering Test')
    .setDescription('A simple money transfer system RESTFUL API using NestJs ( with Typescript), PostgreSQL (TypeORM) by R.O.Olatunji')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  //The route to access Swagger UI
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
