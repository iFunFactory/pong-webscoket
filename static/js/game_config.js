"user strict";

class GameConfig {
    //Display
    static get screen_size() {
        return {
            width: 600,
            height: 600
        }
    }

    static get player_block_pos_size() {
        var screen_size = GameConfig.screen_size;
        var width = 100;
        var height = 40;

        var pos_x = (screen_size.width / 2) - (width / 2);
        var pos_y = [50, 510];
        var block_pos_and_size = [{
                width: width,
                height: height,
                x: pos_x,
                y: pos_y[1]

            }, {
                width: width,
                height: height,
                x: pos_x,
                y: pos_y[0]
            },

        ];
        return block_pos_and_size;
    }

    static get scoreboard_pos() {
        return [{
                name: {
                    x: 50,
                    y: 350,
                    width: 100,
                    height: 40
                },
                score: {
                    x: 50,
                    y: 380,
                    width: 100,
                    height: 40
                }
            },
            {
                name: {
                    x: 50,
                    y: 250,
                    width: 100,
                    height: 40
                },
                score: {
                    x: 50,
                    y: 235,
                    width: 100,
                    height: 40
                }
            }
        ];
    }

    static get edge_pos_size() {
        var screen_size = GameConfig.screen_size;
        var thickness = 10;
        return {
            left: { x: 0, y: 0, width: thickness, height: screen_size.height },
            right: {
                x: screen_size.width - thickness,
                y: 0,
                width: thickness,
                height: screen_size.height
            },
            top: { x: 0, y: 0, width: screen_size.width, height: thickness },
            bottom: {
                x: 0,
                y: screen_size.height - thickness,
                width: screen_size.width,
                height: thickness
            },
        }
    }

    // Game rule
    static get match_score() {
        return 3;
    }
};

export { GameConfig };