// Need to implement earcut.js into this code
LE.Vertices = {
    square : function(faceSize) {
        var vertices = [
            {x: 0, y: 0},
            {x: 0, y: faceSize},
            {x: faceSize, y: faceSize},
            {x: faceSize, y: 0}
        ];
        var renderVerts = JSON.parse(JSON.stringify(vertices));
        return { vertices: vertices, renderVerts: renderVerts };
    },
    rectangle : function(width, height) {
        var vertices = [
            {x: 0, y: 0},
            {x: 0, y: height},
            {x: width, y: height},
            {x: width, y: 0}
        ];
        var renderVerts = JSON.parse(JSON.stringify(vertices));
        return { vertices: vertices, renderVerts: renderVerts };
    },
    rhombus : function(faceSize, angle) {
        var vertices = [ {x: 0, y: 0} ];
        vertices.push({x: Math.sin(LE.Utilities.degToRad(angle)) * faceSize, y: Math.cos(LE.Utilities.degToRad(angle)) * faceSize });
        vertices.push({x: vertices[1].x + faceSize, y: vertices[1].y});
        vertices.push({x: vertices[0].x + faceSize, y: vertices[0].y});
        var renderVerts = JSON.parse(JSON.stringify(vertices));
        return { vertices: vertices, renderVerts: renderVerts };
    },
    parallelogram : function(width, height, angle) {
        var vertices = [ {x: 0, y: 0} ];
        vertices.push({x: Math.sin(LE.Utilities.degToRad(angle)) * width, y: Math.cos(LE.Utilities.degToRad(angle)) * height });
        vertices.push({x: vertices[1].x + width, y: vertices[1].y});
        vertices.push({x: vertices[0].x + width, y: vertices[0].y});
        var renderVerts = JSON.parse(JSON.stringify(vertices));
        return { vertices: vertices, renderVerts: renderVerts };
    },
    trapezium : function() {
        // To do
    },
    trapezoid : function() {
        // To do
    },
    kite : function() {
        // To do
    },
    regularPolygon : function(faceSize, numberOfVertices) {
        if(numberOfVertices < 3) {
            console.error("A regular polygon cannot have less than 3 vertices.")
        }
        var vertices = [];
        var renderVerts = [];
        for(var i = 0; i < numberOfVertices; i++) {
            vertices.push( { x: (Math.sin(i/numberOfVertices*2*Math.PI) * faceSize), 
                y: (Math.cos(i/numberOfVertices*2*Math.PI) * faceSize)} );
            renderVerts.push( { x: (Math.sin(i/numberOfVertices*2*Math.PI) * faceSize), 
                y: (Math.cos(i/numberOfVertices*2*Math.PI) * faceSize)} );
            // Required because using WebGL TRIANGLE_STRIP render function
            // Needed for both shadows and shape render
            if(numberOfVertices > 4) {
                if(i % 3 == 0) {
                    vertices.push( { x: 0, y: 0 } );
                    renderVerts.push( { x: 0, y: 0 } );
                }  
            }
        }

        // This should work for all vertex lengths now
        if(vertices.length >= 7) {
            if(vertices.length % 4 == 0) {
                renderVerts.push( { x: 0, y: 0 } );
            }
        }

        var size = LE.Utilities.sizeFromVerts(vertices);
        for(var i = 0; i < vertices.length; i++) {
            vertices[i].x += size.width / 2;
            vertices[i].y += size.height / 2;
        }
        for(var i = 0; i < renderVerts.length; i++) {
            renderVerts[i].x += size.width / 2;
            renderVerts[i].y += size.height / 2;
        }
        return { vertices: vertices, renderVerts: renderVerts };
    }
}