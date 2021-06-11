<template>
    <div class="drawing-board container">
        <div class="row no-padding">
            <div class="col-12">
                <div id="stage" class="border-secondary"></div>
            </div>
            <div class="col-12">
                <div class="toolbar" v-if="canDraw">
                    <div class="action-tools">
                        <button @click="chooseTool('pencil')" :class="{ active: currentTool === 'pencil' }">
                            <img src="../assets/toolbar-icons/pencil.png" alt="">
                        </button>
                        <button title="矩形" @click="chooseTool('rectangle')"
                                :class="{ active: currentTool === 'rectangle' }">
                            <img src="../assets/toolbar-icons/rectangle.png" alt="">
                        </button>
                        <button @click="chooseTool('circle')" :class="{ active: currentTool === 'circle' }">
                            <img src="../assets/toolbar-icons/circle.png" alt="">
                        </button>
                        <button @click="chooseTool('fill')" :class="{ active: currentTool === 'fill' }">
                            <img src="../assets/toolbar-icons/fill.png" alt="">
                        </button>
                        <button v-if="false" @click="chooseTool('select')"
                                :class="{ active: currentTool === 'select' }">
                            <img src="../assets/toolbar-icons/select.png" alt="">
                        </button>
                        <button @click="chooseTool('eraser')" :class="{ active: currentTool === 'eraser' }">
                            <img src="../assets/toolbar-icons/eraser.png" alt="">
                        </button>
                        <button @click="chooseTool('clear')" :class="{ active: currentTool === 'clear' }">
                            <img src="../assets/toolbar-icons/clear.png" alt="">
                        </button>
                        <button @click="chooseTool('undo')" :disabled="!canUndo">
                            <img v-if="canUndo" src="../assets/toolbar-icons/undo.png" alt="">
                            <img v-else src="../assets/toolbar-icons/undo_disabled.png" alt="">
                        </button>
                        <button @click="chooseTool('redo')" :disabled="!canRedo">
                            <img v-if="canRedo" src="../assets/toolbar-icons/redo.png" alt="">
                            <img v-else src="../assets/toolbar-icons/redo_disabled.png" alt="">
                        </button>
                        <button @click="toggleStrokeWidthTool">
                            <img src="../assets/toolbar-icons/toggle-stroke-width.png" alt="">
                        </button>
                        <div class="stroke-tool" v-if="showStrokeWidthTool">
                            <svg width="175" height="40" xmlns="http://www.w3.org/2000/svg">
                                <g>
                                    <polygon :fill="currentColor"
                                             points="1.5064549446105957,20.06640625 150.87176513671875,35.90804672241211 150.87176513671875,4.224765777587891 1.5064549446105957,20.06640625 "></polygon>
                                    <circle cx="153.75" cy="20.066406" :fill="currentColor" r="16.095154"></circle>
                                </g>
                            </svg>
                            <input type="range" min="1" max="40" step="1" v-model="currentStrokeWidth">
                        </div>
                    </div>

                    <div class="color-tools">
                        <button v-for="(color, i) in colorList" :key=i @click="changeColor(color)"
                                :class="{ active: currentColor === color }">
                            <span :style="'background:' + color"></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  import Konva from 'konva';
  import {generateRandomId, debounce} from "../lib/util";

  export default {
    props: {
      canDraw: {
        type: Boolean,
        default: true
      },
      canEmit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        currentTool: "pencil",
        currentColor: this.colorList[0],
        currentStrokeWidth: 3,
        isDrawing: false,
        drawingStartPosition: {x: 0, y: 0},
        drawingShape: null,
        showStrokeWidthTool: false,
        operationList: [],
        operationRedoList: []
      }
    },
    watch: {
      currentStrokeWidth(newValue) {
        this.currentStrokeWidth = parseInt(newValue);
      },
      currentTool(newValue, oldValue) {
        if (!this.canDraw) {
          return;
        }
        if (oldValue === "select") {
          this.toggleDraggable(false);
          let transformer = this.layer.findOne('Transformer');
          if (transformer) {
            transformer.destroy();
            this.layer.draw();
          }
        } else if (oldValue === "fill") {
          this.toggleListening(false);
        }
        if (newValue === "select") {
          this.toggleDraggable(true);
        } else if (newValue === "fill") {
          this.toggleListening(true);
        }
      }
    },

    computed: {
      canUndo() {
        return this.operationList.length > 0;
      },

      canRedo() {
        return this.operationRedoList.length > 0;
      }
    },

    methods: {
      exportImage() {
        return this.stage.toDataURL({pixelRatio: window.devicePixelRatio});
      },

      setStageBackground(color) {
        let backgroundNode = this.backgroundLayer.children[0];
        if (color) {
          backgroundNode.fill(color);
        } else {
          let backgroundColor = this.$store.state.darkMode ? "#323232" : "#ffffff";
          backgroundNode.fill(backgroundColor);
        }
        this.backgroundLayer.draw();
      },

      toggleDraggable(draggable) {
        this.layer.children.forEach((node) => {
          node.listening(draggable);
          node.draggable(draggable);
        });
        this.layer.drawHit();
      },

      toggleListening(listening) {
        this.layer.children.forEach((node) => {
          node.listening(listening);
        });
        this.layer.drawHit();
      },

      chooseTool(tool) {
        if (tool === "clear") {
          if (this.canEmit) {
            this.$emit('draw', {tool: "clear"})
          }
          this.layer.clear();
          this.layer.destroyChildren();
          this.setStageBackground();
          this.operationList = [];
          this.operationRedoList = [];
        } else if (tool === "undo") {
          let operation = this.operationList.pop();
          this.operationRedoList.push(operation);
          this.undoOperation(operation);
          if (this.canEmit) {
            this.$emit('draw', {tool: operation.tool, attrsUndo: operation.attrsUndo, undo: true});
          }
        } else if (tool === "redo") {
          let operation = this.operationRedoList.pop();
          this.operationList.push(operation);
          this.applyOperation(operation);
          if (this.canEmit) {
            this.$emit('draw', operation)
          }
        } else {
          this.currentTool = tool;
        }
      },

      handleDrawingOperation(operation) {
        if (operation.undo) {
          this.undoOperation(operation);
        } else {
          this.applyOperation(operation);
        }
      },

      handleMouseMove(point) {
        if (!this.drawingShape) {
          return;
        }
        switch (this.currentTool) {
          case "pencil":
          case "eraser":
            this.drawingShape.points(this.drawingShape.points().concat([point.x, point.y]));
            break;
          case "rectangle":
            this.drawingShape.setAttrs({
              width: point.x - this.drawingStartPosition.x,
              height: point.y - this.drawingStartPosition.y,
            });
            break;
          case "circle":
            this.drawingShape.setAttrs({
              radius: Math.hypot(point.x - this.drawingStartPosition.x, point.y - this.drawingStartPosition.y),
            });
            break;
        }
        this.layer.batchDraw();
      },

      buildInitialShape(payload) {
        this.drawingStartPosition = {x: payload.x, y: payload.y};
        switch (this.currentTool) {
          case "pencil":
          case "eraser":
            this.drawingShape = new Konva.Line({
              points: [payload.x, payload.y],
              stroke: this.currentColor,
              strokeWidth: this.currentStrokeWidth,
              lineJoin: "round",
              lineCap: "round",
              listening: false,
              draggable: false,
              id: payload.id
            });
            if (this.currentTool === "eraser") {
              this.drawingShape.globalCompositeOperation("destination-out");
            }
            break;
          case 'rectangle':
            this.drawingShape = new Konva.Rect({
              x: payload.x,
              y: payload.y,
              stroke: this.currentColor,
              strokeWidth: this.currentStrokeWidth,
              listening: false,
              draggable: false,
              id: payload.id
            });
            break;
          case "circle":
            this.drawingShape = new Konva.Circle({
              x: payload.x,
              y: payload.y,
              stroke: this.currentColor,
              strokeWidth: this.currentStrokeWidth,
              listening: false,
              draggable: false,
              id: payload.id
            });
            break;
          default:
            this.drawingShape = null;
            break;
        }
        if (this.drawingShape) {
          this.layer.add(this.drawingShape);
          this.layer.draw();
        }
      },

      changeColor(color) {
        this.currentColor = color;
      },

      changeStrokeWidth(width) {
        this.currentStrokeWidth = width;
      },

      isShapeToolSelected(tool) {
        let curTool = tool || this.currentTool;
        return ["rectangle", "circle", "pencil", "eraser"].includes(curTool);
      },

      isSelectToolSelected() {
        return this.currentTool === "select";
      },

      isFillToolSelected() {
        return this.currentTool === "fill";
      },

      toggleStrokeWidthTool() {
        this.showStrokeWidthTool = !this.showStrokeWidthTool;
      },

      getToolData(point) {
        switch (this.currentTool) {
          case "pencil":
          case "eraser":
            return {
              points: this.drawingShape.points(),
              stroke: this.currentColor,
              strokeWidth: this.currentStrokeWidth,
              id: this.drawingShape.id()
            };
          case 'rectangle':
            return {
              x: this.drawingStartPosition.x,
              y: this.drawingStartPosition.y,
              width: point.x - this.drawingStartPosition.x,
              height: point.y - this.drawingStartPosition.y,
              stroke: this.currentColor,
              strokeWidth: this.currentStrokeWidth,
              id: this.drawingShape.id()
            };
          case "circle":
            return {
              x: this.drawingStartPosition.x,
              y: this.drawingStartPosition.y,
              radius: Math.hypot(point.x - this.drawingStartPosition.x, point.y - this.drawingStartPosition.y),
              stroke: this.currentColor,
              strokeWidth: this.currentStrokeWidth,
              id: this.drawingShape.id()
            };
          default:
            return null
        }
      },

      applyFullOperations(operationList) {
        operationList.forEach((op) => this.applyOperation(op, false));
        this.layer.batchDraw();
      },

      applyOperation(operation, enableBatchDraw = true) {
        const tool = operation.tool.toLowerCase();
        let shape;

        if (tool === "pencil" || tool === "eraser") {
          const attrs = Object.assign({}, operation.attrs, {
            lineJoin: "round",
            lineCap: "round",
            listening: false,
            draggable: false,
          });
          shape = new Konva.Line(attrs);
          if (tool === "eraser") {
            shape.globalCompositeOperation("destination-out");
          }
        } else if (tool === "clear") {
          this.layer.clear();
          this.layer.destroyChildren();
          this.setStageBackground();
        } else if (tool === "fill") {
          if (operation.attrs.id) {
            this.stage.findOne('#' + operation.attrs.id).fill(operation.attrs.stroke);
            this.layer.draw();
          } else {
            this.setStageBackground(operation.attrs.stroke);
          }
        } else if (tool === "rectangle") {
          const attrs = Object.assign({}, operation.attrs, {
            listening: false,
            draggable: false,
          });
          shape = new Konva.Rect(attrs);
        } else if (tool === "circle") {
          const attrs = Object.assign({}, operation.attrs, {
            listening: false,
            draggable: false,
          });
          shape = new Konva.Circle(attrs);
        }
        if (shape) {
          this.layer.add(shape);
          if (enableBatchDraw) {
            this.layer.batchDraw();
          }
        }
      },

      undoOperation(operation) {
        const tool = operation.tool.toLowerCase();
        if (this.isShapeToolSelected(tool)) {
          this.stage.findOne('#' + operation.attrsUndo.id).destroy();
          this.stage.draw();
        } else if (tool === "fill") {
          if (operation.attrsUndo.id) {
            this.stage.findOne('#' + operation.attrsUndo.id).fill(operation.attrsUndo.stroke);
            this.layer.draw();
          } else {
            this.setStageBackground(operation.attrsUndo.stroke);
          }
        }
      },

      getStageContainerSize() {
        const node = document.getElementById("stage");
        return {
          width: node.clientWidth,
          height: node.clientHeight
        }
      }
    },

    beforeCreate() {
      this.colorList = ["#464f41", "#f05945", "#54e346", "#51adcf", "#ffcc29", "#654062", "#7868e6", "#f3bda1", "#83a95c"];
    },

    beforeDestroy() {
      window.removeEventListener("resize", this.resizeHandler);
    },

    mounted() {
      if (window.stageHeight) {
        document.getElementById("stage").style.height = window.stageHeight + "px";
      }

      let stageContainerSize = this.getStageContainerSize();

      this.stage = new Konva.Stage({
        container: "stage",
        width: stageContainerSize.width,
        height: stageContainerSize.height,
        listening: this.canDraw,
      });

      this.backgroundLayer = new Konva.Layer();
      let backgroundNode = new Konva.Rect({
        x: 0,
        y: 0,
        width: stageContainerSize.width,
        height: stageContainerSize.height,
        listening: false,
        draggable: false,
      });
      this.backgroundLayer.add(backgroundNode);
      this.stage.add(this.backgroundLayer);

      this.layer = new Konva.Layer();
      this.stage.add(this.layer);

      this.setStageBackground();

      this.resizeHandler = debounce(() => {
        let backgroundNode = this.backgroundLayer.children[0];
        const containerSize = this.getStageContainerSize();
        this.stage.setAttrs(containerSize);
        backgroundNode.setAttrs(containerSize);
        this.backgroundLayer.batchDraw();
      }, 400);
      window.addEventListener("resize", this.resizeHandler);

      if (!this.canDraw) {
        return;
      }

      this.stage.on('mousedown touchstart', (e) => {
        if (this.isShapeToolSelected()) {
          const point = this.stage.getPointerPosition();
          this.isDrawing = true;
          let payload = {x: point.x, y: point.y, id: generateRandomId()};
          this.buildInitialShape(payload);
        } else if (this.isFillToolSelected()) {
          let currentNode = e.target;
          let lastStroke = null;
          if (currentNode === this.stage) {
            lastStroke = this.backgroundLayer.children[0].fill();
            this.setStageBackground(this.currentColor);
          } else {
            lastStroke = currentNode.fill();
            currentNode.fill(this.currentColor);
            this.layer.draw();
          }
          let currentOperation = {tool: this.currentTool, attrs: {id: e.target.id(), stroke: this.currentColor}};
          if (this.canEmit) {
            this.$emit('draw', currentOperation);
          }
          currentOperation.attrsUndo = {id: currentOperation.attrs.id, stroke: lastStroke};
          this.operationList.push(currentOperation);
        } else if (this.isSelectToolSelected()) {
          let currentNode = e.target;
          let transformer = this.stage.findOne("Transformer");
          if (transformer && transformer.isTransforming()) {
            return;
          }
          if (transformer) {
            if (currentNode === this.stage) {
              transformer.destroy();
              this.stage.draw();
            } else {
              transformer.nodes([currentNode]);
              this.stage.draw();
            }
          } else {
            if (currentNode !== this.stage) {
              let transformer = new Konva.Transformer({
                nodes: [currentNode],
              });
              this.layer.add(transformer);
              this.layer.draw();
            }
          }
        }
      });

      this.stage.on("mousemove touchmove", (e) => {
        e.evt.preventDefault();
        e.evt.stopPropagation();
        if (this.isDrawing) {
          const point = this.stage.getPointerPosition();
          this.handleMouseMove(point);
        }
      });

      this.stage.on("mouseup touchend", () => {
        if (this.isDrawing) {
          const endPoint = this.stage.getPointerPosition();
          if (endPoint.x === this.drawingStartPosition.x && endPoint.y === this.drawingStartPosition.y) {
            this.drawingShape.destroy();
            this.stage.draw();
          } else {
            const operation = {tool: this.currentTool, attrs: this.getToolData(endPoint)};
            operation.attrsUndo = {id: operation.attrs.id};
            if (this.canEmit) {
              this.$emit('draw', operation);
            }
            this.operationList.push(operation);
          }
          this.drawingShape = null;
          this.isDrawing = false;
        }
      });
    }
  }
</script>

<style scoped>
    #stage {
        height: 520px;
        user-select: none;
    }

    .toolbar {
        display: flex;
        flex-direction: column;
        z-index: 10;
        margin-top: 10px;
        justify-content: center;
        align-items: center;
    }

    .toolbar button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        outline: none;
        margin: 5px;
        padding: 0;
        border: none;
        vertical-align: middle;
        text-align: center;
    }

    .toolbar button.active {
        border: 3px solid #000033;
    }

    .toolbar button > img {
        width: 26px;
        height: 26px;
        vertical-align: middle;
        pointer-events: none;
    }

    .toolbar button > span {
        width: 22px;
        height: 22px;
        border-radius: 11px;
        display: inline-block;
        vertical-align: middle;
    }

    .stroke-tool {
        display: inline-block;
        position: relative;
        width: 172px;
        z-index: 100;
        vertical-align: middle;
    }

    .stroke-tool svg {
        position: absolute;
        pointer-events: none;
        z-index: -1;
    }

    .stroke-tool input {
        width: 100%;
        height: 20px;
        -webkit-appearance: none;
        appearance: none;
        outline: none;
        margin: 10px 0;
        background-color: transparent;
        -webkit-tap-highlight-color: transparent;
    }

    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        height: 34px;
        width: 10px;
        background-color: #000033;
        border: none;
        border-radius: 5px
    }

    input[type=range]::-moz-range-thumb {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        height: 34px;
        width: 10px;
        background-color: #000033;
        border: none;
        border-radius: 5px
    }

    input[type=range]::-ms-thumb {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        height: 34px;
        width: 10px;
        background-color: #000033;
        border: none;
        border-radius: 5px
    }

    @media screen and (max-width: 600px) {
        .toolbar button {
            width: 30px;
            height: 30px;
            margin: 2px;
        }

        .toolbar button > img {
            width: 18px;
            height: 18px;
        }

        .toolbar button > span {
            width: 16px;
            height: 16px;
            border-radius: 8px;
        }
    }
</style>
