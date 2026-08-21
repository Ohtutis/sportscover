"""Background removal for athlete poses.

Called by cutout.ts. Kept as a tiny script rather than a dependency because the rembg
CLI itself is broken on this machine (its `s` command imports gradio, which fails on
Python 3.9) while the library API is fine.

PROVIDER: CPU, forced. onnxruntime on this Mac advertises CoreMLExecutionProvider first
and rembg takes it by default — and `new_session()` then hangs indefinitely compiling the
model for the Neural Engine. It never returns, never errors, and sits at 0% CPU, which
looks exactly like a slow model rather than a deadlock. Diagnosed 2026-08-20 after two
runs were killed at four minutes on a 512 px image. Do not "optimise" this back to CoreML.

Model choice matters here. u2net is the default and it chops hair into a hard stencil;
BiRefNet keeps individual strands and the mesh of a hockey cage, which is exactly where
a cutout gives itself away once it sits on a dark background. First run downloads the
weights to ~/.u2net.
"""
import sys
from rembg import remove, new_session

src, dst = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else "birefnet-general"

session = new_session(model, providers=["CPUExecutionProvider"])
with open(src, "rb") as f:
    data = f.read()
# NO post_process_mask. It runs a morphological cleanup that binarises the alpha: the
# result had 0.00% partially-transparent pixels, i.e. a hard stencil, and hair and the
# helmet cage came back cut with scissors. BiRefNet's raw soft alpha is the whole reason
# for choosing it over u2net — do not throw it away tidying the mask.
out = remove(data, session=session)
with open(dst, "wb") as f:
    f.write(out)
print(f"matte {model} -> {dst}")
