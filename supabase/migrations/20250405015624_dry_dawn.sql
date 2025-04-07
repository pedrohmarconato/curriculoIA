/*
  # Create user credits table and functions

  1. New Tables
    - `user_credits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `credits` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Functions
    - `add_credits`: Add credits to a user
    - `use_credit`: Use one credit from user's balance
    - `get_user_credits`: Get user's current credit balance

  3. Security
    - Enable RLS on user_credits table
    - Add policies for authenticated users
*/

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  credits integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT credits_non_negative CHECK (credits >= 0)
);

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own credits"
  ON user_credits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id uuid,
  p_credits integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_credits (user_id, credits)
  VALUES (p_user_id, p_credits)
  ON CONFLICT (user_id)
  DO UPDATE SET
    credits = user_credits.credits + p_credits,
    updated_at = now();
END;
$$;

-- Function to use a credit
CREATE OR REPLACE FUNCTION use_credit(
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credits integer;
BEGIN
  SELECT credits INTO v_credits
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_credits > 0 THEN
    UPDATE user_credits
    SET credits = credits - 1,
        updated_at = now()
    WHERE user_id = p_user_id;
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Function to get user credits
CREATE OR REPLACE FUNCTION get_user_credits(
  p_user_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credits integer;
BEGIN
  SELECT credits INTO v_credits
  FROM user_credits
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_credits, 0);
END;
$$;

-- Trigger to add initial credit on first sign up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_credits (user_id, credits)
  VALUES (NEW.id, 1);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();