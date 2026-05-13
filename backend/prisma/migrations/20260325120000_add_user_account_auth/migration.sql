CREATE TABLE "user_accounts" (
  "id" UUID NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "role" "Role" NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "department_scope_id" UUID,
  "project_scope_ids" UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_accounts_email_key" ON "user_accounts"("email");
CREATE INDEX "user_accounts_role_active_idx" ON "user_accounts"("role", "active");

ALTER TABLE "user_accounts"
ADD CONSTRAINT "user_accounts_department_scope_id_fkey"
FOREIGN KEY ("department_scope_id")
REFERENCES "departments"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
