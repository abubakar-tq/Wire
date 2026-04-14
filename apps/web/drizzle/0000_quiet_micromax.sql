CREATE SCHEMA "app";
--> statement-breakpoint
CREATE TABLE "app"."players" (
	"player_id" integer PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"team_code" text,
	"role" text,
	"image_url" text,
	"active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
