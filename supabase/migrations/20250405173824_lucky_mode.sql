/*
  # Add credits to specific user

  1. Changes
    - Add unique constraint on user_id to enable upsert operations
    - Add 1000 credits to user with email pedrohmarconato@gmail.com
    - Uses direct SQL update/insert for reliability

  2. Security
    - Uses existing RLS policies
    - Maintains credit constraints
*/

-- First ensure user_id has a unique constraint
ALTER TABLE user_credits
ADD CONSTRAINT user_credits_user_id_key UNIQUE (user_id);

-- Add credits to the user
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'pedrohmarconato@gmail.com';

  -- Add credits if user exists
  IF v_user_id IS NOT NULL THEN
    -- Insert or update credits
    INSERT INTO user_credits (user_id, credits)
    VALUES (v_user_id, 1000)
    ON CONFLICT (user_id)
    DO UPDATE SET
      credits = user_credits.credits + 1000,
      updated_at = now();
  END IF;
END $$;