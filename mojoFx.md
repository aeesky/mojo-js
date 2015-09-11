# API #

```
mojoFx(target)     return  moFx

@param {HTMLElement | Array | NodeList} target 
- some HTMLElements need animate

@return  The object includes HTMLElements and API functions
```


## anim ##
```
moFx.anim(props, [duration, easing, callback, arguments, queue])   return moFx

@param {Object} props  Css property object
- The format is like css style's property  ({backgroundColor: "#fff"})
  The value of property can be 3 forms:
  1. Number: {width: 50}
  2. String: 
      - {width: "50"}
      - {width: "50px"}    with unit
      - {width: "+=50px"}, {width: "-=50"}  relative add or sub value
  3. Array:
      - [property value, easing value]

@param [duration, easing, callback, arguments, queue]
- This 5 args all are optional and no fix order
  So, if the type of the arg is:
  - Number, it is duration:  Animation time
  - String, it is easing:    Animation easing type
  - Function, it is callback:  Animation callback function 
  - Boolean, it is queue: Means this animation whether into queue
  - Array, it is arguments:  callback function's arguments

  And the callback function's context "this" is current Animate HTMLElement


@return  The object includes HTMLElements and API functions
```


## delay ##
```
moFx.delay(times)  return moFx

@param {Number} times
- Animation queue delay times (Millisecond)

@return  The object includes HTMLElements and API functions
```


## stop ##
```
moFx.stop(clearqueue)  return moFx

@param {Boolean} clearqueue 
- Whether clear current animation queue

@return  The object includes HTMLElements and API functions
```