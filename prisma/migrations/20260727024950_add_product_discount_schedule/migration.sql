-- AlterTable
ALTER TABLE `products` ADD COLUMN `discountEndDate` DATETIME(3) NULL,
    ADD COLUMN `discountStartDate` DATETIME(3) NULL;
