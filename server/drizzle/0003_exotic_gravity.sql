CREATE TYPE "public"."furnishing" AS ENUM('furnished', 'semi', 'unfurnished');--> statement-breakpoint
CREATE TYPE "public"."preferred_tenants" AS ENUM('students', 'working', 'family', 'any');--> statement-breakpoint
CREATE TABLE "locality_neighbors" (
	"locality_id" integer NOT NULL,
	"neighbor_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "room_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."room_type";--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('single', 'double', 'multiple', '1bhk', '2bhk', '3bhk', '4bhk');--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "room_type" SET DATA TYPE "public"."room_type" USING "room_type"::"public"."room_type";--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "deposit" integer;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "area_sqft" integer;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "available_from" timestamp;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "furnishing" "furnishing";--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "preferred_tenants" "preferred_tenants" DEFAULT 'any' NOT NULL;--> statement-breakpoint
ALTER TABLE "locality_neighbors" ADD CONSTRAINT "locality_neighbors_locality_id_localities_id_fk" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locality_neighbors" ADD CONSTRAINT "locality_neighbors_neighbor_id_localities_id_fk" FOREIGN KEY ("neighbor_id") REFERENCES "public"."localities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "locality_neighbors_uniq" ON "locality_neighbors" USING btree ("locality_id","neighbor_id");