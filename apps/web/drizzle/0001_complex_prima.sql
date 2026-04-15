CREATE TABLE "app"."teams" (
	"team_code" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"short_name" text,
	"logo_url" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
