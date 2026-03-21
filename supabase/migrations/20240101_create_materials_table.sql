-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  url TEXT,
  storage_path TEXT,
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_materials_studio_id ON materials(studio_id);
CREATE INDEX idx_materials_professor_id ON materials(professor_id);
CREATE INDEX idx_materials_created_at ON materials(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Create policies for materials table
-- 1. Professors can view materials for their studios
CREATE POLICY "Professors can view materials for their studios" ON materials
  FOR SELECT USING (
    auth.uid() = professor_id OR
    auth.uid() IN (
      SELECT professor_id FROM studios WHERE id = studio_id
    )
  );

-- 2. Professors can upload materials for their studios
CREATE POLICY "Professors can upload materials for their studios" ON materials
  FOR INSERT WITH CHECK (
    auth.uid() = professor_id AND
    auth.uid() IN (
      SELECT professor_id FROM studios WHERE id = studio_id
    )
  );

-- 3. Professors can update their own materials
CREATE POLICY "Professors can update their own materials" ON materials
  FOR UPDATE USING (auth.uid() = professor_id);

-- 4. Professors can delete their own materials
CREATE POLICY "Professors can delete their own materials" ON materials
  FOR DELETE USING (auth.uid() = professor_id);

-- 5. Students can view materials for their enrolled studios
CREATE POLICY "Students can view materials for enrolled studios" ON materials
  FOR SELECT USING (
    studio_id IN (
      SELECT studio_id FROM student_memberships 
      WHERE student_id = auth.uid() AND status = 'active'
    )
  );

-- 6. Admins can do everything
CREATE POLICY "Admins can manage all materials" ON materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
