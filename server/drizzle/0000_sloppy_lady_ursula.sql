CREATE TYPE "public"."gender_pref" AS ENUM('male', 'female', 'any');--> statement-breakpoint
CREATE TYPE "public"."intent" AS ENUM('buy', 'rent');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('pg', 'hostel', 'apartment', 'flat');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('single', 'double', 'shared');--> statement-breakpoint
CREATE TABLE "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"state" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"listing_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"listing_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"city" varchar(100) NOT NULL,
	"locality" varchar(100) NOT NULL,
	"landmark" varchar(200),
	"address" text,
	"price" integer NOT NULL,
	"room_type" "room_type" NOT NULL,
	"property_type" "property_type" NOT NULL,
	"food_included" boolean DEFAULT false NOT NULL,
	"gender_pref" "gender_pref" DEFAULT 'any' NOT NULL,
	"amenities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rules" text,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"city_id" integer DEFAULT NULL,
	"locality_id" integer DEFAULT NULL,
	"intent" "intent" DEFAULT 'rent' NOT NULL,
	"completeness_score" integer DEFAULT 0 NOT NULL,
	"status" "listing_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "localities" (
	"id" serial PRIMARY KEY NOT NULL,
	"city_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(64) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"name" varchar(100),
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "contact_leads" ADD CONSTRAINT "contact_leads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_leads" ADD CONSTRAINT "contact_leads_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_locality_id_localities_id_fk" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "localities" ADD CONSTRAINT "localities_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cities_slug_idx" ON "cities" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "contact_leads_user_listing_uniq" ON "contact_leads" USING btree ("user_id","listing_id");--> statement-breakpoint
CREATE UNIQUE INDEX "favorites_user_listing_uniq" ON "favorites" USING btree ("user_id","listing_id");--> statement-breakpoint
CREATE INDEX "listings_city_idx" ON "listings" USING btree ("city");--> statement-breakpoint
CREATE INDEX "listings_owner_idx" ON "listings" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "listings_status_idx" ON "listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "listings_city_status_idx" ON "listings" USING btree ("city","status");--> statement-breakpoint
CREATE INDEX "listings_city_id_idx" ON "listings" USING btree ("city_id");--> statement-breakpoint
CREATE INDEX "listings_locality_id_idx" ON "listings" USING btree ("locality_id");--> statement-breakpoint
CREATE INDEX "listings_intent_idx" ON "listings" USING btree ("intent");--> statement-breakpoint
CREATE UNIQUE INDEX "localities_city_slug_idx" ON "localities" USING btree ("city_id","slug");--> statement-breakpoint
CREATE INDEX "localities_city_idx" ON "localities" USING btree ("city_id");--> statement-breakpoint
CREATE INDEX "otp_email_idx" ON "otp_sessions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "otp_expires_idx" ON "otp_sessions" USING btree ("expires_at");