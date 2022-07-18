class Controls {
  constructor(controlType) {
    this.left = false;
    this.right = false;
    this.forward = false;
    this.reverse = false;

    switch (controlType) {
      case "asaber":
        this.#addKeyboardKeys();
        break;
      case "dummy":
        this.forward = true;
        break;
    }

  }

  #addKeyboardKeys() {
    document.onkeydown = (event) => {
     switch (event.key) {
       case "ArrowLeft":
         this.left = true;
         break;
       case "ArrowRight":
         this.right = true;
         break;
       case "ArrowDown":
         this.reverse = true;
         break;
       case "ArrowUp":
         this.forward = true;
         break;
     }
     // console.table(this)
    }
    document.onkeyup = (event) => {
      switch (event.key) {
        case "ArrowLeft":
          this.left = false;
          break;
        case "ArrowRight":
          this.right = false;
          break;
        case "ArrowDown":
          this.reverse = false;
          break;
        case "ArrowUp":
          this.forward = false;
          break;
      }
      console.log(this)

    }
  }
}