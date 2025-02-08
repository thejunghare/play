#include <iostream>
#include <stack>
using namespace std;

void convert(string s) {
  stack<int> st;

  for (int i = 0; i < s.length(); i++) {
    if (s[i] >= '0' && s[i] <= '9') {
      st.push(s[i] - '0');
    }
  }

  cout << st.top();
}

int main() {
  string s = "2+3*1";

  convert(s);

  return 0;
}
