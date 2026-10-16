import {
	BufferAttribute,
	BufferGeometry,
	TriangleFanDrawMode,
	TriangleStripDrawMode
} from '../three.module.min.js';

function toTrianglesDrawMode( geometry, drawMode ) {
	if ( drawMode === TriangleFanDrawMode ) {
		console.warn( 'THREE.BufferGeometryUtils: toTrianglesDrawMode() does not support TriangleFanDrawMode.' );
		return geometry;
	}
	if ( drawMode === TriangleStripDrawMode ) {
		let index = geometry.getIndex();
		if ( index === null ) {
			const indices = [];
			const position = geometry.getAttribute( 'position' );
			if ( position !== undefined ) {
				for ( let i = 0; i < position.count - 2; i ++ ) {
					if ( i % 2 === 0 ) {
						indices.push( i, i + 1, i + 2 );
					} else {
						indices.push( i + 1, i, i + 2 );
					}
				}
				geometry.setIndex( indices );
			}
		}
	}
	return geometry;
}

export { toTrianglesDrawMode };
