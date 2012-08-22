(function(globals, $) {
    globals.Exploder = function(element, options) {
        this.options = $.extend({}, this.options, options);

        this.alpha = this.options.startingAlpha;
        var pointColor = this.options.pointColor.replace(/#/, '');
        this.pointColor = [
            parseInt(pointColor.substr(0, 2), 16),
            parseInt(pointColor.substr(2, 2), 16),
            parseInt(pointColor.substr(4, 2), 16)
        ];
        this.body = $('body');
        this.source = element;
    };

    globals.Exploder.prototype = {
        options: {
            duration: 1,
            pointRadius: 1,
            seeds: 500,
            startingPositionVariation: 1,
            incrementVariation: 2,
            pointColor: "#333333",
            startingAlpha: 255,
            alphaIncrement: 15,
            xVariation: 1.5,
            yVariation: 1,
            destroySource: true
        },

        explode: function() {
            this.canvas = $('<canvas></canvas>');

            this.body.append(this.canvas);
            var pos = this.source.offset();
            pos.left -= this.canvas.width() / 2;
            pos.left += this.source.width() / 2;
            pos.top -= this.canvas.height() / 2;
            pos.top += this.source.height() / 2;
            this.canvas.offset(pos);

            this.processing = new Processing(
                this.canvas[0],
                this.doExplode.bind(this)
            );
        },

        doExplode: function(processing) {
            if (this.options.destroySource) {
                this.source.remove();
            }

            var canvasWidth = this.canvas.width();
            var canvasHeight = this.canvas.height();
            processing.size(canvasWidth, canvasHeight);
            processing.background(255, 0);

            var canvasCenterX = canvasWidth / 2 - this.options.pointRadius;
            var canvasCenterY = canvasHeight / 2 - this.options.pointRadius;

            var explodingPoints = [];
            for (i=0; i<this.options.seeds; ++i) {
                var x = canvasCenterX;
                var y = canvasCenterY;
                var angle = Math.random() * 2 * Math.PI;

                var xInc = Math.sin(angle) * this.options.incrementVariation;
                var yInc = Math.cos(angle) * this.options.incrementVariation;

                xInc += (Math.random() * this.options.incrementVariation * 2) - this.options.incrementVariation;
                yInc += (Math.random() * this.options.incrementVariation * 2) - this.options.incrementVariation;

                xInc = xInc * this.options.xVariation;
                yInc = yInc * this.options.yVariation;

                explodingPoints.push({ x: x, y: y, xInc: xInc, yInc: yInc });
            }

            processing.draw = function() {
                processing.background(255, 0);

                if (this.alpha > 0) {
                    this.alpha -= this.options.alphaIncrement;
                } else {
                    this.finishExplode();
                }

                processing.fill(this.pointColor[0], this.pointColor[1], this.pointColor[2], this.alpha);
                processing.noStroke();

                for (i=0; i<explodingPoints.length; ++i) {
                    var point = explodingPoints[i];

                    processing.ellipse(
                        point.x,
                        point.y,
                        this.options.pointRadius * 2,
                        this.options.pointRadius * 2
                    );

                    point.x += (point.xInc / this.options.duration);
                    point.y += (point.yInc / this.options.duration);
                }
            }.bind(this);
        },

        finishExplode: function(canvas, processing) {
            this.canvas.remove();
            this.processing.exit();
        }
    };

}(window, jQuery));
