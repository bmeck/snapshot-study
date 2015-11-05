var fns = [];
function add(v) {
  fns.push(function easy() {
    return v;
  })
}
add('easy_a');
add('easy_b');

require('heapdump').writeSnapshot('heapdump.json');

console.log(fns.map(f=>f()))
