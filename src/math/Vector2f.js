LE.Vector2f = {
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
        return vector1.x * vector2.x + vector1.y * vector2.y;
    },
    equal : function(vector1, vector2) {
        if(vector1.x == vector2.x && vector1.y == vector2.y) {
            return true;
        } else {
            return false;
        }
    },
    scale : function(scale, vector) {
        var newVector = {
            x : vector.x * scale,
            y : vector.y * scale
        }
        return newVector; 
    }
};
