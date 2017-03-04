/**
*	author：ziyun
	by 2016/01/15
	canvas 重绘数轴并联动
*
**/

;(function($){
	function canvasScroll(option){
		// 初始化数据项
		this.initOption(option);
		// 初始化创建canvas
		this.createCanvas();
	}
	canvasScroll.prototype = {
		// default参数合并
		initOption:function(option){
			var d = {
				_diff:100,//数值差值
				_diffText:1000,//文案差值
				text:{
					fontSize:28,
					fontWeight:'lighter',
					fontFamily:'HelveticaNeue-Bold',
					fontColor:'#dddddd'
				},
				line:{
					color:{
						middle:'#FF991A',//中线颜色
						big:'#dddddd',//长线颜色
						small:'#dddddd',//短线颜色
					},
					width:1,
					// 线高度
					height:{
						middle:'half',
						big:22,
						small:12,
					},
					// 一屏幕小格数
					screenCount:40
				},
				tweenType:['Expo','easeOut']
			};
			option = $.extend(true,d,option);

			this.startTime = 0;
			this.startX = 0;
			this.stopAutoMove = true;
			// canvas id
			this.canvasID = 'c_' + new Date().getTime();
			// canvas元素
			this.canvas = '';
			// canvas context
			this.context = '';
			// 动画初始化
			this.animate = $.tweenRun();
			// 计算属性赋值
			this.initCalc(option);
		},
		// 参数处理
		initCalc:function(option){
			// 运动类型
			this.tweenType = option.tweenType;
			//数值小线差值
			this._diff = option._diff;
			//文案差值
			this._diffText = option._diffText;
			// 容器
			this.el = option.el;
			// 外层容器宽度
			this.outWidth = this.el.width()*2;
			// 外层容器高度
			this.outHeight = this.el.height()*2;
			// 数轴线相关属性
			this.line = option.line;
			// text 相关属性
			this.text = option.text;
			// 小竖线之间的距离
			this.line.distance = this.outWidth/this.line.screenCount;
			// move callback
			this.scrollMove = option.scrollMove;
			// end callback
			this.scrollEnd = option.scrollEnd;

			// 数据处理
			if($.isArray(option.data)){
				// 数据类型 枚举
				this.dataType = 'enum';
				this.data = option.data;
				this.enumToChange();
			}else{
				// 数据类型 区间范围
				this.dataType = 'range';
				this.min = parseInt(option.data.min);
				this.max = parseInt(option.data.max);
				this.val = parseInt(option.data.defaultVal);
				this.valToText();
			}
		},
		// 枚举值改变为obj
		enumToChange:function(){
			this.val = 0*this._diffText;
			this.valToText();
			this.min = 0*this._diffText;
			this.max = (this.data.length - 1)*this._diffText;
		},
		// 创建canvas
		createCanvas:function(){
			var html = '<canvas style="width:'+ this.outWidth/2 +'px" id="'+ this.canvasID +'" width="'+ this.outWidth +'" height="'+ this.outHeight +'"></canvas>';
			this.el.html(html);

			this.canvas = $('#' + this.canvasID);
			this.context = this.canvas.get(0).getContext('2d');
			this.context.translate(0.5, 0);
			this.draw();
			this._bind();
		},
		// 绘制数轴
		draw:function(){
			var context = this.context;
			context.clearRect(0,0,this.outWidth,this.outHeight);
			context.lineWidth = this.line.width;
			context.fillStyle = this.text.fontColor;
			context.font = this.text.fontWeight +" "+ this.text.fontSize +"px "+ this.text.fontFamily;
			context.textBaseline = "bottom";
            context.textAlign = "center";

            this._drawContent(context);
			this._drawMiddle(context);
		},
		// 绘制
		_drawContent:function(context){//symbol -1 左侧 1 右侧
			var half = this.line.screenCount/2,
				left_val = Math.floor((this.val - this.min)/this._diff),
				right_val = Math.ceil((this.max - this.val)/this._diff);

		    left_val = left_val > half ? half : left_val;
		    right_val = right_val > half ? half : right_val;

			// 中点差值数值
			var	percentage,
				startH,
				val = parseInt(this.val / this._diff)*this._diff;

			// 画线和数值
			var drawLine = function(symbol){
				if(symbol == -1){//左侧
					percentage = this.val % this._diff/this._diff;
				}else{//右侧
					percentage = (this._diff - (this.val % this._diff))/this._diff;
				}
				startH = this.line.height.small;
				context.strokeStyle = this.line.color.small;
				// 当前数值
				var text = val + symbol*i*this._diff,
					x;
				if(symbol == -1){//左侧
					x = this.outWidth/2 - i*this.line.distance - percentage * this.line.distance;
				}else{//右侧
					x = this.outWidth/2 + (i - 1)*this.line.distance + percentage * this.line.distance;
				}
				// 根据数值画值
				if(text == this.min || text % this._diffText == 0){
					context.strokeStyle = this.line.color.big;
					startH = this.line.height.big;
					var sqMin = this.val - (this._diff/2);
					var sqMax = parseInt(this.val) + (this._diff/2);
					if(text < sqMin || text > sqMax){
						this._drawText(text,x,this.outHeight - startH,context);	
					}
				}

				context.beginPath();
			    context.moveTo(x, this.outHeight - startH);
			    context.lineTo(x, this.outHeight);
			    context.stroke();
			}.bind(this);

		    context.save();
			context.strokeStyle = this.line.color.small;
			for(var i = left_val;i >= 0;i--){
				drawLine(-1);
			}
			for(var i = 1;i <= right_val;i++){
				drawLine(1);
			}
		    context.restore();
		},
		// 中间线
		_drawMiddle:function(context){
		    context.save();
			context.strokeStyle = this.line.color.middle;
			context.beginPath();

			var mH = this.line.height.middle === 'half' ? this.outHeight/2:this.outHeight - this.line.height.middle;

		    context.moveTo(this.outWidth/2, mH);
		    context.lineTo(this.outWidth/2, this.outHeight);
		    context.stroke();
		    context.restore();
		},
		// 文字渲染
		_drawText:function(text,width,height,context){
			if(this.dataType == 'enum'){
				text = this.data[parseInt(text/this._diffText)];
			}
			height = height - 5;
            context.fillText(text,width,height);        
		},
		// val 转换为当前数值
		valToText:function(){
			var val = parseInt(this.val),
				distance = this.dataType == 'enum' ? this._diffText:this._diff;

			var remainder =  val % distance,
				half = distance/2,
				valText;
			if(remainder > half){
				valText = Math.ceil(val/distance);
			}else{
				valText = Math.floor(val/distance);
			}

			this.valText = this.dataType == 'enum' ? this.data[valText]:(valText*this._diff).toString();
		},
		// 绑定事件
		_bind:function(){
			this.canvas.on('touchstart',this._touchStart.bind(this));
			this.canvas.on('touchmove',this._touchMove.bind(this));
			this.canvas.on('touchend',this._touchEnd.bind(this));
			this.canvas.on('tap',this._tap.bind(this));
		},
		_tap:function(){
			// console.log('tap stop!');
			this.animate.stop('end');
		},
		_touchStart:function(ev){
			// ev.preventDefault();
			var touch = ev.touches[0];
			this.x = touch.pageX;
			this.y = touch.pageY;
			this.startX = this.x;
			this.startTime = new Date().getTime();
			this.stopAutoMove = false;
			// console.log('start!');
		},
		_touchMove:function(ev){
			// console.log('move!');
			var touch = ev.touches[0];
			this.endX = touch.pageX;
			this.endY = touch.pageY;
			var diffX = this.endX - this.x;
			var diffY = this.endY - this.y;

			if(Math.abs(diffY) > 20 && !this.stopAutoMove){
				return;
			}

			if(Math.abs(diffY) > (Math.abs(diffX) + 50)){
				return;
			}

			ev.preventDefault();
			var timestamp = new Date().getTime();


			var r = this.x - this.endX;
			r = r/this.line.distance;
			if(r == 0){
				return;
			}

			var _temp = parseInt(this.val + r * 0.8 * this._diff);
			_temp = _temp < this.min ? this.min : _temp ; 
			_temp = _temp > this.max ? this.max : _temp ; 

			if(this.val == _temp){
				return;
			}
			this.val = _temp;
			this.valToText();
			if(this.scrollMove){
				this.scrollMove();
			}
			this.draw();
			this.x = this.endX;
			if(!this.stopAutoMove){
				console.log('move stop!');
				this.animate.stop();
			}
			this.stopAutoMove = true;

			if ( timestamp - this.startTime > 300 ) {
				this.startTime = timestamp;
				this.startX = this.x;
			}
		},
		_touchEnd:function(ev){
			ev.preventDefault;
			if(!this.stopAutoMove){
		    	return;
		    }
			var touch = ev.touches[0],
				endTime = new Date().getTime();
			// 距离换算刻度值
			var distanceCount = (this.startX - this.endX)/this.line.distance * this._diff;
			// 时间差值
			var diffTime = endTime - this.startTime;
			// 每毫秒所走数值 速度 
		    var speed = distanceCount / diffTime;
		    // console.log(Math.abs(speed));
		    var direction = speed > 0 ? -1 : 1; //方向
		    var deceleration = this._diff * 5 /parseInt(Math.abs(speed)*this.max);//加速度
		    var nowV = speed + diffTime * deceleration;

		    var lastX = this.endX;
		    var lastVal = this.val;
		    // 总移动数值
		    var moveX =  (-1) * direction * (speed*speed)/(2*deceleration);

		    // 终值
		    var finish = moveX + parseInt(lastVal);

		    var t = 0,d = Math.abs(moveX)/this._diff;
		    // console.log(deceleration + '||' + Math.abs(speed));
		    // console.log(deceleration);
		    var _this = this;

		    function prepareDraw(s){
		    	var bool = true;//是否到头标识符

		    	var _temp = s;

		    	if(_temp < _this.min){
		    		_temp = _this.min;
		    		bool = false;
		    	}

		    	if(_temp > _this.max){
		    		_temp = _this.max;
		    		bool = false;
		    	}

			    _this.val = _temp;
			    _this.valToText();
			    // console.log(_temp);
			    _this.draw();
			    if(_this.scrollMove){
					_this.scrollMove();
				}
			    return bool;
		    }

		    // 执行循环滚动
		    this.animate.init({
				tween:_this.tweenType,
				val:[lastVal,moveX,d],
				callback:function(s){
					if(!prepareDraw(s)){
			    		if(_this.scrollEnd){
							_this.scrollEnd();
						}
			    		return false;
			    	}
			    	return true;
				},
				end:function(s){
					if(_this.scrollEnd){
						_this.scrollEnd();
					}
				}
			});
		},
		constructor:canvasScroll
	}

	$.canvasScroll = function(option){
		return new canvasScroll(option);
	}
})(window.Zepto);
