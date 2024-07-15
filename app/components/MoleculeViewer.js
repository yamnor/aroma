import { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol/build/3Dmol.js';

export default function MoleculeViewer({ pubchemId }) {
  const viewerRef = useRef(null);

  useEffect(() => {
    const fetchAndRender = async () => {
      try {
        const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/CID/${pubchemId}/record/SDF/?record_type=3d&response_type=display`);
        if (!response.ok) {
          throw new Error('Failed to fetch structure data');
        }
        const data = await response.text();

        if (viewerRef.current) {
          const viewer = $3Dmol.createViewer(viewerRef.current, {
            backgroundColor: 'white',
          });
          viewer.addModel(data, 'sdf');
          viewer.setStyle({}, { stick: {} });
          viewer.zoomTo(0.9);
          viewer.render();
        }
      } catch (error) {
        console.error('Error fetching or rendering structure data:', error);
      }
    };

    fetchAndRender();
  }, [pubchemId]);

  return <div ref={viewerRef} style={{ width: '100%', height: '100%' }} />;
}