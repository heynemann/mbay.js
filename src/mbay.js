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

        this.colorDifference = this.colorDiff(this.options.destinationColor, this.pointColor);
        this.body = $('body');
        this.source = element;
    };

    globals.Exploder.prototype = {
        options: {
            speed: 1,
            alphaSpeed: 1,
            pointRadius: 1,
            radiusVariation: 5,
            seeds: 500,
            startingPositionVariation: 1,
            pointColor: "#333333",
            startingAlpha: 255,
            alphaDelay: 0.5,
            xVariation: 1.5,
            yVariation: 1,
            destroySource: true,
            width: 200,
            height: 200,
            onExplodeFinished: null,
            destinationColor: [255, 255, 255]
        },

        colorDiff: function(c1, c2) {
            return [c1[0] - c2[0], c1[1]  - c2[1], c1[2] - c2[2]];
        },
        colorSum: function(c1, c2) {
            return [c1[0] + c2[0], c1[1]  + c2[1], c1[2] + c2[2]];
        },
        colorMult: function(s, c) {
            return [s * c[0], s * c[1], s * c[2]];
        },

        explode: function() {
            this.canvas = $('<canvas></canvas>');
            this.canvas.css('position', 'absolute');
            this.canvas.width(this.options.width);
            this.canvas.height(this.options.height);

            this.body.append(this.canvas);
            var pos = this.source.offset();
            pos.left -= this.options.width / 2;
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

            processing.size(this.options.width, this.options.height);
            processing.background(255, 0);

            var canvasCenterX = this.options.width / 2 - this.options.pointRadius;
            var canvasCenterY = this.options.height / 2 - this.options.pointRadius;

            var explodingPoints = [];

            for (i=0; i<this.options.seeds; ++i) {
                var x = canvasCenterX;
                var y = canvasCenterY;
                var angle = Math.random() * 2 * Math.PI;

                var xInc = Math.sin(angle) * this.options.speed;
                var yInc = Math.cos(angle) * this.options.speed;

                xInc += (Math.random() * this.options.speed * 2) - this.options.speed;
                yInc += (Math.random() * this.options.speed * 2) - this.options.speed;

                xInc = xInc * this.options.xVariation;
                yInc = yInc * this.options.yVariation;

                var randomFactor = Math.random();
                var newRgb = this.colorSum(this.pointColor, this.colorMult(randomFactor, this.colorDifference));

                var size = (this.options.pointRadius * 2) + (Math.random() * this.options.radiusVariation);

                explodingPoints.push({ x: x, y: y, xInc: xInc, yInc: yInc, color: newRgb, size: size, xOffset: xInc > 0 ? -1 : 1, yOffset: yInc > 0 ? -1 : 1 });
            }

            var delay = 0;
            processing.draw = function() {
                delay += 1/60;
                processing.background(255, 0);

                if (delay > this.options.alphaDelay) {
                    if (this.alpha > 0) {
                        this.alpha -= this.options.alphaSpeed;
                    } else {
                        this.finishExplode();
                    }
                }

                processing.noStroke();

                for (i=0; i<explodingPoints.length; ++i) {
                    var point = explodingPoints[i];
                    processing.fill(point.color[0], point.color[1], point.color[2], this.alpha);

                    processing.ellipse(
                        point.x,
                        point.y,
                        point.size,
                        point.size
                    );

                    var incrementX = point.xInc * this.options.speed / 60;
                    var incrementY = point.yInc * this.options.speed / 60;
                    point.x += incrementX;
                    point.y += incrementY;
                    point.xInc += point.xOffset * 0.05;
                    point.yInc += point.yOffset * 0.05;
                }
            }.bind(this);
        },

        finishExplode: function(canvas, processing) {
            this.canvas.remove();
            this.processing.exit();
            if (this.options.onExplodeFinished) {
                this.options.onExplodeFinished();
            }
        }
    };

}(window, jQuery));
