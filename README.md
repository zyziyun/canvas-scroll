使用说明：
-----------------------------------
    先引入zepto库，基础选择元素是基于zepto库的，然后再引入组件库canvasScroll.js，就可以调用了。

参数介绍：
-----------------------------------  
### 属性：
    必填项
    1、data 数轴渲染数据 
    两类：（1）数组为枚举值
          （2）对象为最大值（max）最小值（min）和初始化默认中心值（defaultVal）
    2、el：canvas所处容器的zepto对象（会根据容器大小自动创建canvas对象）

    
    选填项：
    1、_diff 数值差值 默认值 100
       _diffText 文案差值 默认值 1000
    2、text 文案相关
        fontSize 大小 默认值 28,
        fontWeight 粗细 默认值 lighter
        fontFamily 样式 默认值 HelveticaNeue-Bold
        fontColor 颜色 默认值 #dddddd
    3、line 数轴线相关
        color 颜色相关
        middle 中线 默认值 #FF991A
        big 长线 默认值 #dddddd
        small 短线 默认值 #dddddd
        width 宽度 默认值 1
        height 高度相关
        middle 中线 默认值 'half'（容器高度的一般） 
        big 长线 默认值 22
        small 短线 默认值 12
        screenCount 小格数 默认值 40
    4、tweenType 结尾动画曲线类型 默认值 ['Expo','easeOut']

### 方法：
    1、scrollMove：callback 滚动中执行
    2、scrollEnd：callback 停止执行

### 返回：
    this.valText 当前中线所对数据值
