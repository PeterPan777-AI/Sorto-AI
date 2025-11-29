CREATE TABLE `document_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`documentId` integer NOT NULL,
	`tagId` integer NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`fileName` text NOT NULL,
	`filePath` text NOT NULL,
	`fileSize` integer NOT NULL,
	`fileType` text NOT NULL,
	`fileHash` text NOT NULL,
	`extractedText` text,
	`createdAt` integer NOT NULL,
	`modifiedAt` integer NOT NULL,
	`scannedAt` integer NOT NULL,
	`documentType` text,
	`topics` text,
	`categories` text,
	`geographicFocus` text,
	`targetAudience` text,
	`organizations` text,
	`extractedDates` text,
	`duplicateGroupId` integer,
	`similarityScore` integer,
	`processingStatus` text DEFAULT 'pending' NOT NULL,
	`processingError` text
);
--> statement-breakpoint
CREATE TABLE `duplicate_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`masterDocumentId` integer NOT NULL,
	`groupType` text NOT NULL,
	`createdAt` integer NOT NULL,
	`resolvedAt` integer,
	`isResolved` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scan_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`folderPath` text NOT NULL,
	`status` text NOT NULL,
	`startedAt` integer NOT NULL,
	`completedAt` integer,
	`filesScanned` integer,
	`filesProcessed` integer,
	`filesFailed` integer,
	`errorMessage` text
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`name` text NOT NULL,
	`color` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`lastSignedIn` integer NOT NULL,
	`licenseKey` text,
	`licenseStatus` text DEFAULT 'trial' NOT NULL,
	`trialStartDate` integer,
	`trialEndDate` integer,
	`subscriptionEndDate` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);