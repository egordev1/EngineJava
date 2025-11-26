import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.image.BufferStrategy;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class Engine implements Runnable {
    private final Canvas canvas = new Canvas();
    private final JFrame frame = new JFrame("Мой движок");
    private volatile boolean running = true;
    private BufferStrategy bs;
    private List<Sprite> sprites = new ArrayList<>();
    private Sprite selected = null;
    private Camera cam = new Camera();
    private Input input = new Input();

    public Engine() {
        canvas.setPreferredSize(new Dimension(1024, 768));
        canvas.setFocusable(true);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setResizable(false);
        frame.add(canvas);
        frame.pack();
        frame.setLocationRelativeTo(null);
    }

    public void start() {
        SwingUtilities.invokeLater(() -> {
            frame.setVisible(true);
            canvas.requestFocusInWindow();
            canvas.createBufferStrategy(2);
            bs = canvas.getBufferStrategy();
            canvas.addKeyListener(input);
            new Thread(this).start();
        });
    }

    @Override
    public void run() {
        while (running) {
            update();
            render();
            try { Thread.sleep(16); } catch (Exception ignored) {}
        }
    }

    private void update() {
        cam.update(input);
        for (Sprite s : sprites) s.update();

        if (input.wasPressed(KeyEvent.VK_L)) loadSprite();
        if (input.wasPressed(KeyEvent.VK_DELETE) && selected != null) {
            sprites.remove(selected);
            selected = sprites.isEmpty() ? null : sprites.get(sprites.size() - 1);
        }
        if (input.wasPressed(KeyEvent.VK_C) && selected != null) {
            sprites.add(selected.clone());
            selected = sprites.get(sprites.size() - 1);
        }
        if (selected != null) {
            float step = 0.5f;
            if (input.isPressed(KeyEvent.VK_LEFT))  selected.x -= step;
            if (input.isPressed(KeyEvent.VK_RIGHT)) selected.x += step;
            if (input.isPressed(KeyEvent.VK_UP))    selected.y -= step;
            if (input.isPressed(KeyEvent.VK_DOWN))  selected.y += step;
        }
    }

    private void render() {
        if (bs == null) return;

        BufferedImage screen = new BufferedImage(1024, 768, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = screen.createGraphics();
        g.setColor(new Color(10, 10, 15));
        g.fillRect(0, 0, 1024, 768);

        // Сортировка по глубине (2.5D)
        sprites.sort((a, b) -> Float.compare(a.y + (a.img == null ? 0 : a.img.getHeight()), 
                                             b.y + (b.img == null ? 0 : b.img.getHeight())));

        for (Sprite s : sprites) s.draw(screen, cam);

        // HUD
        g.setColor(Color.WHITE);
        g.setFont(new Font("Monospaced", Font.PLAIN, 14));
        g.drawString("L — загрузить PNG", 10, 25);
        g.drawString("←→↑↓ — двигать", 10, 45);
        g.drawString("Del — удалить, C — копия", 10, 65);
        if (selected != null) {
            g.setColor(Color.YELLOW);
            g.drawString("● x=" + String.format("%.1f", selected.x) + ", y=" + String.format("%.1f", selected.y), 10, 85);
        }
        g.dispose();

        Graphics gr = bs.getDrawGraphics();
        gr.drawImage(screen, 0, 0, null);
        gr.dispose();
        bs.show();
    }

    private void loadSprite() {
        JFileChooser fc = new JFileChooser();
        fc.setFileFilter(new javax.swing.filechooser.FileNameExtensionFilter("PNG", "png"));
        if (fc.showOpenDialog(frame) == JFileChooser.APPROVE_OPTION) {
            try {
                BufferedImage img = ImageIO.read(fc.getSelectedFile());
                Sprite s = new Sprite(0, 0, img);
                sprites.add(s);
                selected = s;
            } catch (Exception e) {
                // Тихо. Не мешай работать.
            }
        }
    }

    // ====================================================
    // ВАШИ КЛАССЫ — НИЧЕГО ЛИШНЕГО
    // ====================================================

    private static class Sprite implements Cloneable {
        float x, y;
        BufferedImage img;

        Sprite(float x, float y, BufferedImage img) {
            this.x = x;
            this.y = y;
            this.img = img;
        }

        void update() {}

        void draw(BufferedImage target, Camera cam) {
            if (img == null) return;
            int w = img.getWidth(), h = img.getHeight();
            float sx = x * 32 - y * 32 + 512 + cam.x;
            float sy = x * 16 + y * 16 - h + 384 + cam.y;
            for (int dy = 0; dy < h; dy++) {
                for (int dx = 0; dx < w; dx++) {
                    int px = (int) sx + dx, py = (int) sy + dy;
                    if (px < 0 || py < 0 || px >= target.getWidth() || py >= target.getHeight()) continue;
                    int argb = img.getRGB(dx, dy);
                    if ((argb >>> 24) != 0) target.setRGB(px, py, argb);
                }
            }
        }

        @Override
        public Sprite clone() {
            try {
                Sprite c = (Sprite) super.clone();
                c.x += 1;
                c.y += 1;
                return c;
            } catch (CloneNotSupportedException e) {
                return null;
            }
        }
    }

    private static class Camera {
        float x, y;
        void update(Input i) {
            float s = 8;
            if (i.isPressed(KeyEvent.VK_W)) y -= s;
            if (i.isPressed(KeyEvent.VK_S)) y += s;
            if (i.isPressed(KeyEvent.VK_A)) x -= s;
            if (i.isPressed(KeyEvent.VK_D)) x += s;
        }
    }

    private static class Input extends KeyAdapter {
        private final boolean[] keys = new boolean[256];
        private final boolean[] pressed = new boolean[256];

        @Override
        public void keyPressed(KeyEvent e) {
            int k = e.getKeyCode();
            if (k >= 0 && k < keys.length && !keys[k]) {
                keys[k] = true;
                pressed[k] = true;
            }
        }

        @Override
        public void keyReleased(KeyEvent e) {
            int k = e.getKeyCode();
            if (k >= 0 && k < keys.length) keys[k] = false;
        }

        boolean isPressed(int k) { return k >= 0 && k < keys.length && keys[k]; }
        boolean wasPressed(int k) {
            if (k >= 0 && k < pressed.length && pressed[k]) {
                pressed[k] = false;
                return true;
            }
            return false;
        }
    }

    public static void main(String[] args) {
        new Engine().start();
    }
}