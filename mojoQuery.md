# API #

```
mojoQuery(selector, context)     return Array

@param {String} selector 
- support selector

@param {Undefined | String | HTMLElement | Array | NodeList} context
- selector context

@return Array of HTMLElements
```


# Support selector #

### CSS3 ###
```
*
E
E#myid
E.warning
E F
E > F
E + F
E ~ F

E[foo]	
E[foo="bar"]	
E[foo~="bar"]	
E[foo^="bar"]	
E[foo$="bar"]	
E[foo*="bar"]	
E[foo|="en"]

E:checked
E:disabled
E:enabled
E:empty

E:only-child
E:last-child
E:first-child
E:first-of-type
E:last-of-type
E:only-of-type

E:not(s)
E:nth-child(n)
E:nth-last-child(n)
E:nth-of-type(n)
E:nth-last-of-type(n)
```

### Extra ###
```
:not(E)
:not(E.cls)
:not(:not(E,F))

:has(E)
:has(E.cls)
:has(:not(E,F))
:has(E > F)

[NAME!=VALUE]
:contains(TEXT)
:selected

:first
:last
:even
:odd
:nth
```