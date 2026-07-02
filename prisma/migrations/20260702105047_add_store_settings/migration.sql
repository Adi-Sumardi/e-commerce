-- CreateTable
CREATE TABLE `store_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `name` VARCHAR(191) NOT NULL DEFAULT 'Pratama Jaya',
    `email` VARCHAR(191) NOT NULL DEFAULT 'info@pratamajaya.com',
    `description` TEXT NOT NULL,
    `phone` VARCHAR(191) NOT NULL DEFAULT '+62 812-3456-7890',
    `whatsapp` VARCHAR(191) NOT NULL DEFAULT '+62 812-3456-7890',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
