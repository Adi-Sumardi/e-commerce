-- AlterTable
ALTER TABLE `product_variants` ADD COLUMN `colorHex` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('TEXT', 'COLOR') NOT NULL DEFAULT 'TEXT';
