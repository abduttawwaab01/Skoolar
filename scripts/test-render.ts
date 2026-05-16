import fs from 'fs';
import path from 'path';
import { renderIDCard } from '../src/lib/id-card-utils/render-card';

async function test() {
  const person = {
    type: 'student',
    id: 'STU-2023-001',
    displayId: 'STU-2023-001',
    name: 'John Doe Smith',
    class: 'Grade 10 Science',
    gender: 'Male',
    schoolId: '1',
    photoUrl: 'https://i.pravatar.cc/300?u=johndoe'
  };

  const colors = { primary: '#059669', secondary: '#ffffff' };
  
  // Create portrait front
  const portraitFront = await renderIDCard(
    person, colors, '', true, false, true, 'portrait', person.photoUrl, 'STUDENT', false
  );
  fs.writeFileSync(path.join(process.cwd(), 'test-portrait-front.png'), portraitFront);
  
  // Create portrait back
  const portraitBack = await renderIDCard(
    person, colors, '1. This card is property of the school.\n2. Must be worn at all times.\n3. Replacement fee applies.', true, false, true, 'portrait', person.photoUrl, 'STUDENT', true
  );
  fs.writeFileSync(path.join(process.cwd(), 'test-portrait-back.png'), portraitBack);

  // Create landscape front
  const landscapeFront = await renderIDCard(
    person, colors, '', true, false, true, 'landscape', person.photoUrl, 'STUDENT', false
  );
  fs.writeFileSync(path.join(process.cwd(), 'test-landscape-front.png'), landscapeFront);

  console.log("Done! Rendered 3 test ID cards.");
}

test().catch(console.error);
