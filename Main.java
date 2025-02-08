import static java.lang.System.*;

// java.lang.object -> java(package), lang(package), object(class)

import java.util.Scanner;
import userPackage.GreetClass;

public class Main {

    public static void main(String[] args) {
        System.out.println("Hello! -> from Main class");

        GreetClass myObj = new GreetClass();
        myObj.sayHello();

        out.println("Hello! -> using static");

        int numOne = 12, numTwo = 13;
        myObj.addTwoNumbers(numOne, numTwo);

        String str = "Hello";
        System.out.println(str.hashCode());
    }
}
