CREATE TABLE "users" (
  id VARCHAR(256) UNIQUE PRIMARY KEY,
  email VARCHAR(256) UNIQUE NOT NULL,
  display_name VARCHAR(256) NOT NULL,
  group_id INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "long_terms" (
  "id" SERIAL PRIMARY KEY,
  "user_id" VARCHAR(256) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "start_time" TIMESTAMP WITH TIME ZONE NOT NULL,
  "end_time" TIMESTAMP WITH TIME ZONE NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "cycles" (
  "id" SERIAL PRIMARY KEY,
  "long_term_id" INT NOT NULL REFERENCES long_terms(id) ON DELETE CASCADE,
  "start_time" TIMESTAMP WITH TIME ZONE NOT NULL,
  "end_time" TIMESTAMP WITH TIME ZONE NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "categories" (
  "id" SERIAL PRIMARY KEY,
  "user_id" VARCHAR(256) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "name" VARCHAR(256) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "subcategories" (
  "id" SERIAL PRIMARY KEY,
  "category_id" INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  "name" VARCHAR(256) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "contents" (
  "id" SERIAL PRIMARY KEY,
  "subcategory_id" INT NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  "name" VARCHAR(256) NOT NULL,
  "time_spent" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "cycle_categories" (
  "id" SERIAL PRIMARY KEY,
  "cycle_id" INT REFERENCES cycles(id) ON DELETE CASCADE,
  "long_term_id" INT NOT NULL REFERENCES long_terms(id) ON DELETE CASCADE,
  "category_id" INT NOT NULL REFERENCES categories(id),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  UNIQUE(cycle_id, category_id)
);

CREATE TABLE "cycle_subcategories" (
  "id" SERIAL PRIMARY KEY,
  "cycle_id" INT NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,      
  "long_term_id" INT NOT NULL REFERENCES long_terms(id) ON DELETE CASCADE,
  "subcategory_id" INT NOT NULL REFERENCES subcategories(id),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  UNIQUE(cycle_id, subcategory_id)
);

CREATE TABLE "cycle_contents" (
  "id" SERIAL PRIMARY KEY,
  "cycle_id" INT NOT NULL REFERENCES cycles(id) ON DELETE CASCADE, 
  "content_id" INT NOT NULL REFERENCES contents(id),
  "finished_date" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  UNIQUE(cycle_id, content_id)
);

CREATE TABLE "short_terms" (
  "id" SERIAL PRIMARY KEY,
  "user_id" VARCHAR(256) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "tasks" (
  "id" SERIAL PRIMARY KEY,
  "short_term_id" INT NOT NULL REFERENCES short_terms(id) ON DELETE CASCADE, 
  "content_id" INT NOT NULL REFERENCES cycle_contents(id), 
  "name" VARCHAR(256),
  "time_spent" INTEGER NOT NULL,
  "finished_date" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "subtasks" (
  "id" SERIAL PRIMARY KEY,
  "task_id" INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  "name" VARCHAR(256) NOT NULL,
  "description" TEXT,
  "time_spent" INTEGER NOT NULL DEFAULT 0,
  "finished_date" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "goals" (
  "id" SERIAL PRIMARY KEY,
  "user_id" VARCHAR(256) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "long_term_id" INT NOT NULL REFERENCES long_terms(id) ON DELETE CASCADE,
  "statement" VARCHAR(280) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "goal_category_links" (
  "id" SERIAL PRIMARY KEY,
  "goal_id" INT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  "category_id" INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP),
  UNIQUE(goal_id, category_id)
);

COMMENT ON TABLE "users" IS 'table for describing user characteristics';

COMMENT ON COLUMN "users"."id" IS 'basis of user identification reference in other tables,user id should be also google id in actual scenario';

COMMENT ON COLUMN "users"."email" IS 'only gmail';

COMMENT ON COLUMN "users"."display_name" IS 'equavilent to google account name by default';

COMMENT ON COLUMN "users"."group_id" IS 'not currently in use,  potential scaling when to document group of user';

COMMENT ON TABLE "long_terms" IS 'table for documenting total time of the long term progress';

COMMENT ON TABLE "categories" IS 'table for documenting categories of what to do';

COMMENT ON TABLE "cycle_categories" IS 'table for categories in long term cycles';

COMMENT ON TABLE "subcategories" IS 'table for documenting sub categories of each category';

COMMENT ON TABLE "contents" IS 'table for documenting most detail block of what to be done in each category/sub-cateogry';

COMMENT ON TABLE "short_terms" IS 'table for documenting total time of the short term progress';

COMMENT ON TABLE "tasks" IS 'table for documenting the tasks of the short term progress, including what item was finished and how long it took';

ALTER TABLE "long_terms" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "cycles" ADD FOREIGN KEY ("long_term_id") REFERENCES "long_terms" ("id");

ALTER TABLE "cycle_categories" ADD FOREIGN KEY ("cycle_id") REFERENCES "cycles" ("id");

ALTER TABLE "cycle_categories" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");

ALTER TABLE "cycle_subcategories" ADD FOREIGN KEY ("cycle_id") REFERENCES "cycles" ("id");

ALTER TABLE "cycle_subcategories" ADD FOREIGN KEY ("subcategory_id") REFERENCES "subcategories" ("id");

ALTER TABLE "cycle_contents" ADD FOREIGN KEY ("cycle_id") REFERENCES "cycles" ("id");

ALTER TABLE "cycle_contents" ADD FOREIGN KEY ("content_id") REFERENCES "contents" ("id");

ALTER TABLE "tasks" ADD FOREIGN KEY ("short_term_id") REFERENCES "short_terms" ("id");

ALTER TABLE "tasks" ADD FOREIGN KEY ("content_id") REFERENCES "cycle_contents" ("id");

ALTER TABLE "subtasks" ADD FOREIGN KEY ("task_id") REFERENCES "tasks" ("id");

ALTER TABLE "subcategories" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");

ALTER TABLE "contents" ADD FOREIGN KEY ("subcategory_id") REFERENCES "subcategories" ("id");