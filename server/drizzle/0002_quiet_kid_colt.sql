CREATE TYPE "public"."content_type" AS ENUM('area_guide', 'student_guide', 'comparison', 'rent_advice', 'locality_insight');--> statement-breakpoint
CREATE TABLE "content_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(200) NOT NULL,
	"type" "content_type" NOT NULL,
	"title" varchar(300) NOT NULL,
	"body" text NOT NULL,
	"city_id" integer,
	"locality_id" integer,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "content_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "price_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"locality_id" integer NOT NULL,
	"snapshot_date" timestamp NOT NULL,
	"avg_price" integer NOT NULL,
	"median_price" integer NOT NULL,
	"min_price" integer NOT NULL,
	"max_price" integer NOT NULL,
	"sample_size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "listings_city_idx";--> statement-breakpoint
DROP INDEX "listings_city_status_idx";--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "city_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "city_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "locality_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "locality_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content_pages" ADD CONSTRAINT "content_pages_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_pages" ADD CONSTRAINT "content_pages_locality_id_localities_id_fk" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_snapshots" ADD CONSTRAINT "price_snapshots_locality_id_localities_id_fk" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_slug_idx" ON "content_pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "content_city_idx" ON "content_pages" USING btree ("city_id");--> statement-breakpoint
CREATE INDEX "content_type_idx" ON "content_pages" USING btree ("type");--> statement-breakpoint
CREATE INDEX "snapshots_locality_date_idx" ON "price_snapshots" USING btree ("locality_id","snapshot_date");--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN "locality";