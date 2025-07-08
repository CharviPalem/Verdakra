#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> nums(n);
    for(int i = 0; i < n; ++i)
        cin >> nums[i];

    int target;
    cin >> target;

    unordered_map<int, int> map;
    for(int i = 0; i < n; ++i) {
        int complement = target - nums[i];
        if(map.count(complement)) {
            cout <<  map[complement] << " " << i << endl;
            return 0;
        }
        map[nums[i]] = i;
    }

    cout << "No two sum solution found." << endl;
    return 0;
}
