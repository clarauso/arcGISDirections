define(["dojo/_base/Color", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleLineSymbol"], function(Color, Symbol, SimpleLineSymbol) {
    var symbols = {
        "start" : new Symbol({"angle":0,"xoffset":0,"yoffset":8.15625,"type":"esriPMS","url":"http://static.arcgis.com/images/Symbols/AtoZ/greenA.png","imageData":"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","contentType":"image/png","width":15.75,"height":21.75}),
        "end" : new Symbol({"angle":0,"xoffset":0,"yoffset":8.15625,"type":"esriPMS","url":"http://static.arcgis.com/images/Symbols/AtoZ/redB.png","imageData":"iVBORw0KGgoAAAANSUhEUgAAABUAAAAdCAYAAABFRCf7AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAABUdJREFUSEuFlHlQlHUYx9cyy9HRuE/l8opVZF2QY1mWa4FVFgE55BJEVPIsFWsqs3Ga6o9m8n8LbWqapszUtMYjDgFjYZeQY2Fh2TUWnfJAyZqRMfv2PO++u0At9s5853l/z/P9fn6/fffdlUhmuDorFDLDVtU7hurklo7qlNuk8Y7q5Nv6KlWLoVJxxFAeEzlT9j99fbF8qb5CccZQkz7RX1sAy9sVsL27HaPv7YDtaDUsh8thPJAHw/a0iY6ymNPsfyq8o0Su1lUob5oO5MJ2ZDNGj5TD9lYJqRi2NzfZ9cYmjB4uhY00sE+LtrK4m7qCVWkuwe2FkTmGCsVD60ECvl6Ikdo8jBzIwS/7s+16VSsqi2oWRqg3cigPlle00JdG/96WtzJ7GvinDeErdUXyccuedbhB4RtUrbsySOmw7lTbq3hveTkVlppUWKkKs73rMEyztoLVD5jjBF/LlX5nrFLCupvCNcmwbFeRkkh0v4Mq91h8z7NqJYa3JsBSpYBlG+Vo1lcZj1btsnMCtDVrmVyXH/F4eJsKw2QyV8bBvIUVjweXv4Kr668/H2Ls7AmYCWwuj6ZMrJBtyw1/3KIJlUtaNGHHrhdGwrw5RjAMlcoxVBZF67W4f/FLJ/NGbb6woY3eBsc1Xn8ag8UyDJXIYKZc18ZVaMkMOSZpzgxt7SmMwOCmSJiKVmOwKFK4HyxZg/s/fOEEWPfn0Ga8aRQmblqdfVPBKpgKpDARo2ejFFfVwa2Sq+qgW8a8cJjySRu5koGMg2Qau/D5JHRvln1DkgM6MWqBKW8FBnJXCNWYswJNaYtvSZrUQeN92qXo37CMtFwwDNAmA7Tr2PnPnNDhXRoM5K/EyNFtzt7oB3vQn025bMprl6A3KwxNKYHjkobkwNu9mhAY14XCmLUERtrAqLVvcO/cSZdfFDf/6LoG885MGNeHUTYEfZpg9KQvRkNSwG+SRlVAe5d6Mfoyg2FkuIbg6wlOund2EjpUnUqb0olypbh35sTkY6ktFLJ9BOxKW4TGRP92gvrXdaQEole9CL006M0IspsyQ3D32zpneHBLktBjWQ8VO/t3T39iz5I6kgPQqPStk9Qn+GU0J/qjh3Zxik7ekx6EOxRwXKYKpdBjWQ4WOfu/nvzQnksNRLPSD8yTdKt8nq1X+Og6kwicEiAMBaUF4s43H09CyxVCr1cThrFLp4T+k4lHGCiNE3KdKgISh3nCr6o+1ivtqsL3STeBu+kjOHTn1HHXv6iH43jQdB79BVHgzPUkPzQpfJ4wZ9qfypVY79ea473xc6Ivrif6TZeKgg6Jsy7ysdjPOc67/Pv7McZ7T0Os9yNDAgWU/y/2sf9KtOfup/1Rz7ogd0+6FO05pONTJ/jMKF2cF9jHfgLOcgXlJj/g50gvvL90wUvfyz1b22K90Enwf4v7PGcf+8Uc551wvmHYPJIHKYAUIp0/O/LcGvf+dgbTqRziNfd5zj7RzznOM0cA8w7cYBjvLCfFkxIr/efWXF7j9lgf4wEDiSuvuc9z0cd+znGeOcIrNZu0gBRGiiKpSPxqZJA0n0oXNrdGuUO/1gNcec19cc4+9nOO88xh3rSThosGPimbU8t85+67JHP7Wx/tAa685r44Zx8DOTftpI5nOp8GnuIwVPxIMqqxX0sX9l2Tu4Mrr0nc54/MPoZxjvPOZ8qnnfrtzxUNblR9SMHHly/4qFHmBq68Fvs8ZxD7GTbt22eo42L4M6KBn83zpHlHQ+bJLka8CK68Fvs8ZxD7Xb6nU8FTNxA2SXWbM+dCxEJwnQKZEfQPBIABDFc5AMMAAAAASUVORK5CYII=","contentType":"image/png","width":15.75,"height":21.75}),
    	"route" : new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 255, 0.5]), 5)
    };
    return symbols;
});