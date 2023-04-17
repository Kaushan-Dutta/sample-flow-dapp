pub contract Greetings {
 
    pub var greeting: String

     init() {
        self.greeting = "Hello, World!"
    }

    pub fun hello(): String {
        return self.greeting
    }
    pub fun setGreet(greet:String){
        self.greeting=greet
    }
}
 