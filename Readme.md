https://gist.github.com/Narazaka/036b30ea9e1bbe2cc86ed81c61e0bca0

```javascript
import {NamedManager, NamedManagerPhaserRenderer} from "ghost-urn";

const element = document.getElementById("#named-manager");
const renderer = new NamedManagerPhaserRenderer(element);

await renderer.initializeGame();

const namedManager = new NamedManager(renderer);
namedManager.materialize(...);
```
