LE.OrthographicCamera = function(x, y) {
    this.x = x,
    this.y = y,
    this.mvMatrix = mat4.create(),
    this.pMatrix = mat4.create(),
    this.mvMatrixStack = [];
};

// All functions bellow are used by the WebGL Renderer
LE.OrthographicCamera.prototype.ortho = function(left, right, bottom, top, near, far) {
    mat4.ortho(this.pMatrix, left, right, bottom, top, near, far);
};

LE.OrthographicCamera.prototype.identity = function(matrix) {
    mat4.identity(matrix);  
}

LE.OrthographicCamera.prototype.translate = function(x, y, z) {
    mat4.translate(this.mvMatrix, this.mvMatrix, [x , y , z]);
};

LE.OrthographicCamera.prototype.rotate = function(rotation, x, y, z) {
    mat4.rotate(this.mvMatrix, this.mvMatrix, rotation, [x, y, z]);
};

LE.OrthographicCamera.prototype.mvPushMatrix = function() {
    var copy = mat4.create();
    mat4.copy(copy, this.mvMatrix);
    this.mvMatrixStack.push(copy);  
};

LE.OrthographicCamera.prototype.mvPopMatrix = function() {
    if (this.mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    this.mvMatrix = this.mvMatrixStack.pop();
};
