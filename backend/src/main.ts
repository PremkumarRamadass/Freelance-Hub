import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('LanceNexus Enterprise REST API')
    .setDescription(
      'Complete PostgreSQL-backed API for Freelancers, Clients, Agency Admins, Projects, Tasks, GST Quotations, Invoices, and Payments.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'LanceNexus API Documentation',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 LanceNexus REST API is running on http://localhost:${port}/api`);
  console.log(`📚 Swagger OpenAPI Documentation available at http://localhost:${port}/api/docs`);
}
await bootstrap();
