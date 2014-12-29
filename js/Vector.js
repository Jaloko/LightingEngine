var Vector2f = {
    sub : function(vector1, vector2) {
        var newVector = {
            x: vector1.x - vector2.x,
            y: vector1.y - vector2.y
        }
        return newVector;
    },
    add : function(vector1, vector2) {

        var newVector = {
            x: vector1.x + vector2.x,
            y: vector1.y + vector2.y
        };

        return newVector;
    },
    dot : function(vector1, vector2) {
        var newVector = {
            x: vector1.x * vector2.x,
            y: vector1.y * vector2.y
        }
        return newVector.x + newVector.y;
    }      
}

function scale(scale, vector) {
    var newVector = {
        x : vector.x * scale,
        y : vector.y * scale
    }

    return newVector;
}