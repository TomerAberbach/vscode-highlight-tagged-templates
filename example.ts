/* eslint-disable typescript/ban-ts-comment, typescript/no-unused-vars, typescript/no-unused-expressions, typescript/no-unsafe-call */
// @ts-nocheck

css`
  a {
    color: rebeccapurple;
  }
`

csharp`
  using System;

  class Program
  {
      static void Main()
      {
          Console.WriteLine("Hello World!");
      }
  }
`

fish`
  function hello
    echo "Hello World!"
  end
`

go`
  package main

  import "fmt"

  func main() {
      fmt.Println("Hello World!")
  }
`

html`
  <!DOCTYPE html>
  <html>
    <head>
      <title>Hello World</title>
    </head>
    <body>
      <h1>Hello World!</h1>
    </body>
  </html>
`

java`
  public class HelloWorld {
      public static void main(String[] args) {
          System.out.println("Hello World!");
      }
  }
`

javascript`
  console.log("Hello World!");
`

json`
  {
    "message": "Hello World!"
  }
`

kotlin`
  fun main() {
      println("Hello World!")
  }
`

const indented = [
  markdown`
    # Hello World

    Paragraph

    ## Heading 2

    ### Heading 3

    #### Heading 4

    ##### Heading 5

    ###### Heading 6

    _italic_ **bold**

    \`inline code\`

    - Bullet 1
    - Bullet 2

    1. Number 1
    2. Number 2
    3. Number 3

    ~~~ts
    const x = 2
    ~~~

    ${''}
    \`\`\`ts
    console.log('hi!')
    \`\`\`

    > quote

    ---

    [title](https://www.example.com)

    ![alt text](image.jpg)
  `,
]
console.log(`Hello World!`)

markdown`
  # Hello World
`

php`
  <?php
  echo "Hello World!";
  ?>
`

python`
  print("Hello World!")
`

ruby`
  puts "Hello World!"
`

shell`
  #!/bin/bash
  echo "Hello World!"
`

terraform`
  resource "null_resource" "hello" {
    provisioner "local-exec" {
      command = "echo Hello World!"
    }
  }
`

typescript`
  console.log("Hello World!");
`

yaml`
  message: "Hello World!"
`
