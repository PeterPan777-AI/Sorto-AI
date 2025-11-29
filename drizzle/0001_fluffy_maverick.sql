CREATE TABLE `document_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`tagId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(500) NOT NULL,
	`filePath` text NOT NULL,
	`fileSize` int NOT NULL,
	`fileType` varchar(50) NOT NULL,
	`fileHash` varchar(64) NOT NULL,
	`extractedText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`modifiedAt` timestamp NOT NULL,
	`scannedAt` timestamp NOT NULL DEFAULT (now()),
	`documentType` varchar(100),
	`topics` text,
	`categories` text,
	`geographicFocus` text,
	`targetAudience` varchar(200),
	`extractedDates` text,
	`organizations` text,
	`duplicateGroupId` int,
	`similarityScore` int,
	`processingStatus` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`processingError` text,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `duplicate_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`masterDocumentId` int,
	`groupType` enum('exact','similar','version') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolved` boolean NOT NULL DEFAULT false,
	CONSTRAINT `duplicate_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scan_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`folderPath` text NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`filesScanned` int NOT NULL DEFAULT 0,
	`filesProcessed` int NOT NULL DEFAULT 0,
	`filesFailed` int NOT NULL DEFAULT 0,
	`status` enum('running','completed','failed','cancelled') NOT NULL DEFAULT 'running',
	`errorMessage` text,
	CONSTRAINT `scan_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`color` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `licenseKey` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `licenseStatus` enum('trial','active','expired','cancelled') DEFAULT 'trial' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `trialStartDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `trialEndDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionEndDate` timestamp;--> statement-breakpoint
CREATE INDEX `documentId_idx` ON `document_tags` (`documentId`);--> statement-breakpoint
CREATE INDEX `tagId_idx` ON `document_tags` (`tagId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `documents` (`userId`);--> statement-breakpoint
CREATE INDEX `fileHash_idx` ON `documents` (`fileHash`);--> statement-breakpoint
CREATE INDEX `duplicateGroup_idx` ON `documents` (`duplicateGroupId`);--> statement-breakpoint
CREATE INDEX `documentType_idx` ON `documents` (`documentType`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `duplicate_groups` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `scan_history` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `tags` (`userId`);