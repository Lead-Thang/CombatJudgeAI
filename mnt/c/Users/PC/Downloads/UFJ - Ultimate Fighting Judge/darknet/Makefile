CC = gcc
CFLAGS = -Wall -Wextra -Wno-unused-parameter -Wno-unknown-pragmas -O3 -DOPENCV

OBJ = obj/gemm.o obj/utils.o # Add more object files as needed

EXEC = darknet

all: $(EXEC)

$(EXEC): $(OBJ)
	$(CC) $(CFLAGS) -o $@ $^

obj/%.o: src/%.c
	mkdir -p obj
	$(CC) $(CFLAGS) -c $< -o $@

.PHONY: clean

clean:
	rm -rf obj/*.o $(EXEC)