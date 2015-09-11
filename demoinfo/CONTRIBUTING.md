First of all, thank you for wanting to contribute! 
You think you can add a feature or fix our code? Cool! Simply [fork and create a pull-request](https://help.github.com/articles/using-pull-requests/)!

We have few guidlines, try to stand to them. If you make a small mistake, it isn't that bad. 

* Splitting your changes in multiple commits is recommended. However:
  * Don't make too small changes, this will overload Travis, since we try to profile each commit.
  * Each commit should
    * compile
    * be able to parse demo-files and
    * make sense on its own

* Codestyle:
  * We use tabs, no spaces. If you use Visual Studio, please change this for this project. 
    * If you use MonoDevelop you're propably fine. 
  * Avoid calling Platform-Specific-APIs. Travis will build the project on linux, and we will run it there
  * Do braces however you like, as long as it makes sense and is an somewhat accepted style (using an RNG isn't)
  * Comments should explain why you do something, the code explains how
    * Exception: It isn't clear why you would do something like you do it (rewriting framework-methods, ...), and isn't clear from the commit-message. 
