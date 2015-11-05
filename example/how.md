find node type=closure

get .context edge (fn context)
if fn context name !== '"system / Context"'
  get .shared of closure (fn shared)
  get .script of fn shared (fn script)
  get .name and .source

else
  get all edges from fn context with type = 'context' and add to var list

  get .closure of fn context
  - repeat

# retained size

shallow size + sum( retained size of object only accessible through this)

get all objects accessible through this (family)
find all edges from non-family to family (exclude)
sum ((family - exclude)=>size)

