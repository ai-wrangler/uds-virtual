#include "harness.cc"
#include <chrono>
#include <cstdio>
int main() {
  sim_reset(48000);
  sim_set_filter(0);
  auto t0 = std::chrono::steady_clock::now();
  int total = 0;
  for (int i = 0; i < 100; i++) {           // 100 x 480 samples = 1 s of audio
    if (i % 25 == 0) sim_send(4, 0x18 | 4, 20, 9 << 4 | 6, 1 << 4 | 15);
    if (i % 25 == 12) sim_send(4, 0x18 | 0, 80, 7 << 4 | 4, 11 << 4 | 13);
    total += sim_run(480);
  }
  auto t1 = std::chrono::steady_clock::now();
  double s = std::chrono::duration<double>(t1 - t0).count();
  printf("samples %d cycles %.0f frames %.0f time %.3f s -> %.2f MHz simulated (%.2fx real time)\n",
         total, sim_cycles(), sim_frames(), s, sim_cycles() / s / 1e6, sim_cycles() / s / 6e6);
}
