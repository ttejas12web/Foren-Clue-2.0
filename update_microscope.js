const fs = require('fs');

let content = fs.readFileSync('src/components/laboratory/Microscope3D.tsx', 'utf8');

// Replace basic imports
content = content.replace("import { Box, Cylinder, Sphere } from '@react-three/drei';", "import { Box, Cylinder, Sphere, RoundedBox } from '@react-three/drei';");

// Update materials and geometries
// It might be easier to just rewrite the component since we want to add realistic properties everywhere.
